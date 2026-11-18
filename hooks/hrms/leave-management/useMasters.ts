'use client';
import type { LeaveAuthorization } from '@/app/(root)/hrms/leave-management/masters/leave-authorization/_components/columns';
import type { MasterLeave } from '@/app/(root)/hrms/leave-management/masters/master-leave/_components/columns';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { createLocalCrud } from '@/lib/localdb';
import { getMasterLeaveYear } from '@/server/hrms/hrmsConfig/master/leave-year';
import {
    deleteLeaveAuthorization as deleteLeaveAuthorizationAPI,
    getInstitutionsByLoginBased,
    getLeaveAuthorization,
    getLeaveAuthorizationDropdowns,
    getLeaveAuthorizationForEdit,
    saveLeaveAuthorization as saveLeaveAuthorizationAPI
} from '@/server/hrms/leave-management/masters/leave-authorization';
import {
    deleteMasterLeave as deleteMasterLeaveAPI,
    getMasterLeave,
    getMasterLeaveDropdowns,
    getMasterLeaveForEdit,
    saveMasterLeave as saveMasterLeaveAPI,
    toggleMasterLeave as toggleMasterLeaveAPI,
    updateMasterLeaveOrder as updateMasterLeaveOrderAPI
} from '@/server/hrms/leave-management/masters/master-leave';
import type { ApiSearchparams } from '@/types';
import type { LeaveAuthorizationGetResponseData } from '@/types/hrms/leave-management/leave-authorization';
import type { MasterLeaveGetResponseData, MasterLeaveListItem, MasterLeaveSaveRequest } from '@/types/hrms/leave-management/master-leave';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// MasterLeaveYear type - placeholder until actual type is defined
interface MasterLeaveYear {
    id: number;
    createdAt: Date;
    leaveYear: string;
    fromDate: string;
    toDate: string;
    isActive: boolean;
}
/**
 * Map API response data to frontend MasterLeave format
 */
function mapApiDataToMasterLeave(apiData: MasterLeaveGetResponseData | MasterLeaveListItem | null): MasterLeave | null {
    if (!apiData) {
        return null;
    }

    // Normalize data (handle both PascalCase and camelCase)
    const data = apiData as any;
    const id = data.hrmL_Id || data.HRML_Id || data.id || 0;

    // Debug logging for isActive
    console.log('🔍 Mapping Master Leave - ID:', id);
    console.log('🔍 hrmL_ActiveFlag:', data.hrmL_ActiveFlag);
    console.log('🔍 HRML_ActiveFlag:', data.HRML_ActiveFlag);
    console.log('🔍 isActive:', data.isActive);

    return {
        id: id,
        createdAt: data.createdDate || data.CreatedDate ? new Date(data.createdDate || data.CreatedDate) : new Date(),
        hrmL_LeaveName: data.hrmL_LeaveName || data.HRML_LeaveName || data.leaveName || '',
        hrmL_LeaveCode: data.hrmL_LeaveCode || data.HRML_LeaveCode || data.leaveCode || '',
        hrmL_LeaveType: data.hrmL_LeaveType || data.HRML_LeaveType || data.leaveType || '',
        hrmL_LeaveApplyCriteria: data.hrmL_WhenToApplyFlg || data.HRML_LeaveApplyCriteria || data.leaveApplyCriteria || '',
        hrmL_DaysForApplyCriteria: String(
            data.hrmL_NoOfDays !== undefined && data.hrmL_NoOfDays !== null
                ? data.hrmL_NoOfDays
                : data.HRML_DaysForApplyCriteria !== undefined
                  ? data.HRML_DaysForApplyCriteria
                  : data.daysForApplyCriteria || ''
        ),
        hrmL_MaxDaysForApply: String(data.hrmL_MaxDaysForApply || data.HRML_MaxDaysForApply || data.maxDaysForApply || ''),
        hrmL_LeaveDetails: data.hrmL_LeaveDetails || data.HRML_LeaveDetails || data.leaveDetails || '',
        hrmL_LeaveCreditFlg: data.hrmL_LeaveCreditFlg ?? data.HRML_LeaveCreditFlg ?? data.leaveCredit ?? false,
        hrmL_LateDeductFlag: data.hrmL_LateDeductFlag ?? data.HRML_LateDeductFlag ?? data.lateDeduct ?? false,
        hrmL_ProbationNotApplicableFlg:
            data.hrmL_ProbationNotApplicableFlg ?? data.HRML_ProbationNotApplicableFlg ?? data.probationNotApplicable ?? false,
        hrmL_LateDeductOrder: data.hrmL_LateDeductOrder || data.HRML_LateDeductOrder || data.leaveOrder || 0,
        // Keep isActive for internal UI state (toggling status)
        isActive: data.hrmL_LeaveCreditFlg ?? data.HRML_LeaveCreditFlg ?? false
    };
}
/**
 * Map frontend MasterLeave format to API request format
 */
function mapMasterLeaveToApiData(data: MasterLeave | Omit<MasterLeave, 'id' | 'createdAt'>): MasterLeaveSaveRequest {
    return {
        MI_Id: HRMS_MI_ID,
        HRML_Id: 'id' in data ? Number(data.id) || 0 : 0,
        HRML_LeaveName: data.hrmL_LeaveName,
        HRML_LeaveCode: data.hrmL_LeaveCode,
        HRML_LeaveDetails: data.hrmL_LeaveDetails || '',
        HRML_LeaveCreditFlg: !!data.hrmL_LeaveCreditFlg,
        HRML_LeaveType: data.hrmL_LeaveType,
        HRML_LateDeductFlag: !!data.hrmL_LateDeductFlag,
        HRML_LateDeductOrder: Number(data.hrmL_LateDeductOrder || 0),
        HRML_ActiveFlag: data.isActive,
        HRML_ProbationNotApplicableFlg: !!data.hrmL_ProbationNotApplicableFlg,
        HRML_LeaveApplyCriteria: data.hrmL_LeaveApplyCriteria || '',
        HRML_DaysForApplyCriteria: data.hrmL_DaysForApplyCriteria ? Number(data.hrmL_DaysForApplyCriteria) : 0,
        HRML_MaxDaysForApply: data.hrmL_MaxDaysForApply ? Number(data.hrmL_MaxDaysForApply) : 0,
        CreatedDate: 'createdAt' in data && data.createdAt instanceof Date ? data.createdAt.toISOString() : new Date().toISOString()
    };
}
/**
 * Hook to fetch master leave dropdown options (leave types, etc.)
 */
export function useMasterLeaveDropdowns() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE, 'dropdowns'],
            queryFn: async () => {
                try {
                    const dropdowns = await getMasterLeaveDropdowns({
                        MI_Id: HRMS_MI_ID
                    });
                    return {
                        success: true,
                        data: dropdowns,
                        message: 'Dropdown data fetched successfully'
                    };
                } catch (error: any) {
                    throw new Error(error?.message || 'Failed to fetch dropdown data');
                }
            },
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
            retry: 1
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE, 'dropdowns']
            });
        }
    };
}
// Master Leave hooks
export function useMasterLeave(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE, 'list', searchParams ?? {}],
            queryFn: async () => {
                try {
                    // Call API with search parameters
                    const response = await getMasterLeave(searchParams);
                    if (!response.success) {
                        throw new Error(response.message || 'Failed to fetch master leave');
                    }
                    // Extract list from response
                    let leaveList: MasterLeave[] = [];
                    const data = response.data;
                    let leaveOrderList: any[] = [];

                    if (data) {
                        // Case 1: data is directly an array (New GET API)
                        if (Array.isArray(data)) {
                            leaveList = data
                                .map((item: any) => mapApiDataToMasterLeave(item))
                                .filter((item: MasterLeave | null): item is MasterLeave => item !== null);
                        }
                        // Case 2: data is an object with list fields (Wrapper API)
                        else if (typeof data === 'object') {
                            const dataObj = data as any;
                            const possibleLists = [dataObj.list, dataObj.GridviewDetails, dataObj.leavelistedit, dataObj.leaveData];

                            if (dataObj.leaveOrderList) {
                                leaveOrderList = dataObj.leaveOrderList;
                            }

                            for (const list of possibleLists) {
                                if (list && Array.isArray(list)) {
                                    leaveList = list
                                        .map((item: any) => mapApiDataToMasterLeave(item))
                                        .filter((item: MasterLeave | null): item is MasterLeave => item !== null);
                                    if (leaveList.length > 0) break;
                                }
                            }

                            // If single record in object
                            if ((leaveList.length === 0 && (dataObj as any).hrmL_Id) || (dataObj as any).HRML_Id) {
                                const mapped = mapApiDataToMasterLeave(dataObj);
                                if (mapped) leaveList = [mapped];
                            }
                        }
                    }
                    return {
                        success: true,
                        data: leaveList,
                        leaveOrderList: leaveOrderList,
                        total: response.total || leaveList.length,
                        page: response.page || 1,
                        page_Size: response.page_Size || 10,
                        message: response.message || 'Master leave fetched successfully'
                    };
                } catch (error: any) {
                    // Error message from API is already in error.message
                    throw new Error(error?.message || 'Failed to fetch master leave');
                }
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
            });
        }
    };
}
export function useSaveMasterLeave() {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; data: MasterLeave; message: string }, Error, Omit<MasterLeave, 'id' | 'createdAt'>>({
        mutationFn: async (data: Omit<MasterLeave, 'id' | 'createdAt'>) => {
            const apiData = mapMasterLeaveToApiData(data);
            const response = await saveMasterLeaveAPI(apiData);
            if (!response.success) {
                throw new Error(response.message || 'Failed to save master leave');
            }

            // If API returns null data, synthesize response from input data
            let mappedData: MasterLeave | null = null;

            if (response.data) {
                mappedData = mapApiDataToMasterLeave(response.data);
            }

            // If mapping failed or data was null, create a response from the input data
            if (!mappedData) {
                mappedData = {
                    id: 0, // Will be updated on refetch
                    createdAt: new Date(),
                    ...data
                };
            }

            return {
                success: true,
                data: mappedData,
                message: response.message || 'Master leave saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to save master leave');
        }
    });
}
/**
 * Hook to fetch master leave data for editing
 * Uses the Edit endpoint to get fresh data for a specific leave
 */
export function useMasterLeaveForEdit(HRML_Id: number | null) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE, 'edit', HRML_Id],
            queryFn: async () => {
                if (!HRML_Id) {
                    throw new Error('HRML_Id is required');
                }
                try {
                    const response = await getMasterLeaveForEdit(HRML_Id);
                    if (!response.success) {
                        throw new Error(response.message || 'Failed to fetch leave data for editing');
                    }
                    // Map API response to frontend format
                    const mappedData = mapApiDataToMasterLeave(response.data);
                    if (!mappedData) {
                        throw new Error('Failed to parse leave data');
                    }
                    return {
                        success: true,
                        data: mappedData,
                        message: response.message || 'Leave data fetched successfully'
                    };
                } catch (error: any) {
                    throw new Error(error?.message || 'Failed to fetch leave data for editing');
                }
            },
            enabled: !!HRML_Id && HRML_Id > 0,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE, 'edit']
            });
        }
    };
}
export function useUpdateMasterLeave() {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; data: MasterLeave; message: string }, Error, MasterLeave>({
        mutationFn: async (data: MasterLeave) => {
            if (!data.id) {
                throw new Error('ID is required for update');
            }
            const apiData = mapMasterLeaveToApiData(data);
            const response = await saveMasterLeaveAPI(apiData);
            if (!response.success) {
                throw new Error(response.message || 'Failed to update master leave');
            }
            // Map response back to frontend format
            const mappedData = mapApiDataToMasterLeave(response.data);
            if (!mappedData) {
                throw new Error('Failed to parse updated leave data');
            }
            return {
                success: true,
                data: mappedData,
                message: response.message || 'Master leave updated successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to update master leave');
        }
    });
}
/**
 * Hook to toggle master leave activation status
 * Uses the toggle_master_leave endpoint
 */
export function useToggleMasterLeave() {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message: string }, Error, number>({
        mutationFn: async (HRML_Id: number) => {
            try {
                const response = await toggleMasterLeaveAPI(HRML_Id);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to toggle status');
                }
                return {
                    success: true,
                    message: response.message || 'Status toggled successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to toggle status');
            }
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to toggle status');
        }
    });
}

/**
 * Hook to update master leave sequence/order
 * Uses the update_master_leave_order endpoint
 */
export function useUpdateMasterLeaveOrder() {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message: string }, Error, Array<{ id: number; order: number }>>({
        mutationFn: async (orders: Array<{ id: number; order: number }>) => {
            try {
                const response = await updateMasterLeaveOrderAPI(orders);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to update order');
                }
                return {
                    success: true,
                    message: response.message || 'Order updated successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to update order');
            }
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update order');
        }
    });
}
/**
 * Hook to delete master leave
 * Uses the DeletePages endpoint
 */
export function useDeleteMasterLeave() {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; message: string }, Error, number>({
        mutationFn: async (HRML_Id: number) => {
            if (!HRML_Id || HRML_Id <= 0) {
                throw new Error('Valid HRML_Id is required for deletion');
            }
            try {
                const response = await deleteMasterLeaveAPI(HRML_Id);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to delete master leave');
                }
                return {
                    success: true,
                    message: response.message || 'Master leave deleted successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to delete master leave');
            }
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to delete master leave');
        }
    });
}

// Master Leave Year hooks
export function useMasterLeaveYear() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeaveYear>('masterLeaveYear');
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR, 'list'],
            queryFn: async () => {
                try {
                    const response = await getMasterLeaveYear();
                    const res = response as any;

                    // Handle wrapped response
                    if (res.success !== undefined && !res.success) {
                        throw new Error(res.message || 'Failed to fetch master leave year');
                    }

                    const data = res.data || res || [];

                    return {
                        success: true,
                        data: Array.isArray(data) ? data : [],
                        message: 'Master leave year fetched successfully'
                    };
                } catch (error: any) {
                    console.error('Error fetching master leave year:', error);
                    // Fallback to empty array to avoid breaking UI
                    return {
                        success: false,
                        data: [],
                        message: error?.message || 'Failed to fetch master leave year'
                    };
                }
            },
            staleTime: 5 * 60 * 1000 // Cache for 5 mins
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
            });
        }
    };
}
export function useSaveMasterLeaveYear() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeaveYear>('masterLeaveYear');
    return useMutation<{ success: boolean; data: MasterLeaveYear; message: string }, Error, Omit<MasterLeaveYear, 'id' | 'createdAt'>>({
        mutationFn: async (data: Omit<MasterLeaveYear, 'id' | 'createdAt'>) => {
            const newLeaveYear = db.create(data);
            return {
                success: true,
                data: newLeaveYear,
                message: 'Master leave year saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save master leave year');
        }
    });
}
export function useUpdateMasterLeaveYear() {
    const queryClient = useQueryClient();
    const db = createLocalCrud<MasterLeaveYear>('masterLeaveYear');
    return useMutation<{ success: boolean; data: MasterLeaveYear; message: string }, Error, MasterLeaveYear>({
        mutationFn: async (data: MasterLeaveYear) => {
            if (data.id) {
                db.update(data.id, data);
                return {
                    success: true,
                    data,
                    message: 'Master leave year updated successfully'
                };
            }
            throw new Error('ID is required for update');
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.MASTER_LEAVE_YEAR]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update master leave year');
        }
    });
}
/**
 * Map API response data to frontend LeaveAuthorization format
 */
function mapApiDataToLeaveAuthorization(apiData: LeaveAuthorizationGetResponseData | any | null): LeaveAuthorization | null {
    if (!apiData) {
        return null;
    }
    const data = apiData as any;
    const mappedData: LeaveAuthorization & {
        _HRLA_Id?: number;
        mI_Id?: number;
        hrmG_Id?: number;
        hrmgT_Id?: number;
        hrmD_Id?: number;
        hrmdeS_Id?: number;
        hrmL_Id?: number;
        approvalPersonId?: number;
        hrlaoN_SanctionLevelNo_Num?: number;
    } = {
        id: data.hrlaoN_Id || data.HRLAON_Id || data.hrlA_Id || data.HRLA_Id || data.hrmlA_Id || data.HRMLA_Id || data.id || 0,
        createdAt: data.createdDate || data.CreatedDate ? new Date(data.createdDate || data.CreatedDate) : new Date(),
        institution: data.mI_Name || data.institutionName || data.InstitutionName || data.institution || 'Vidya Vikasa Vidya Samsthe (R)',
        mI_Id: data.mI_Id || data.MI_Id || data.mi_id || data.MI_id || data.miId || 0, //added
        hrmG_GradeName: data.hrmG_GradeName || data.HRMG_GradeName || data.gradeName || '',
        hrmgT_EmployeeGroupType:
            data.hrmgT_EmployeeGroupType || data.hrmgT_GroupTypeName || data.HRMGT_GroupTypeName || data.groupTypeName || '',
        hrmD_DepartmentName: data.hrmD_DepartmentName || data.HRMD_DepartmentName || data.departmentName || '',
        hrmdeS_DesignationName: data.hrmdeS_DesignationName || data.HRMDES_DesignationName || data.designationName || '',
        hrmL_LeaveName: data.hrmL_LeaveType || data.hrmL_LeaveName || data.HRML_LeaveName || data.leaveType || '',
        hrlaoN_SanctionLevelNo: String(
            data.hrlaoN_SanctionLevelNo || data.hrmlA_OrderOfApproval || data.HRMLA_OrderOfApproval || data.orderOfApproval || ''
        ),
        hrmE_EmployeeFirstName:
            data.hrmE_EmployeeFirstName || data.hrmlA_ApprovalPerson || data.HRMLA_ApprovalPerson || data.approvalPerson || '',
        finalFlag: data.hrlaoN_FinalFlg ?? data.hrmlA_FinalFlag ?? data.HRMLA_FinalFlag ?? data.finalFlag ?? false,

        // Map Raw IDs for Update Form - Aggressive Casing Check
        hrmG_Id: data.hrmG_Id || data.HRMG_Id || data.hrmG_id || data.gradeId || data.GradeId,
        hrmgT_Id: data.hrmgT_Id || data.HRMGT_Id || data.hrmgT_id || data.groupTypeId || data.GroupTypeId,
        hrmD_Id: data.hrmD_Id || data.HRMD_Id || data.hrmD_id || data.departmentId || data.DepartmentId,
        hrmdeS_Id: data.hrmdeS_Id || data.HRMDES_Id || data.hrmdeS_id || data.designationId || data.DesignationId,
        hrmL_Id: data.hrmL_Id || data.HRML_Id || data.hrmL_id || data.leaveTypeId || data.LeaveTypeId,
        approvalPersonId: data.hrmE_Id || data.ivrmuL_Id || data.HRME_Id || data.approvalPersonId || data.ApprovalPersonId || data.hrmE_id,
        hrlaoN_SanctionLevelNo_Num:
            data.hrlaoN_SanctionLevelNo || data.HRMLAON_SanctionLevelNo || data.sanctionLevelNo || data.SanctionLevelNo
    };

    // Store HRLA_Id if available (needed for delete operation)
    // In authorizationGrid it is hrlA_Id or hrmlA_Id
    const hrlA_Id = data.hrlA_Id || data.HRLA_Id || data.hrla_id || data.hrmlA_Id || data.HRMLA_Id;
    console.log(`🔍 Mapping Auth - id: ${mappedData.id}, hrlA_Id found: ${hrlA_Id}`);
    if (hrlA_Id !== undefined && hrlA_Id !== null) {
        mappedData._HRLA_Id = hrlA_Id;
    }
    return mappedData;
}

/**
 * Hook to fetch institutions based on login
 */
export function useInstitutionsByLoginBased() {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATIONS, 'institutions'],
        queryFn: async () => {
            const response = await getInstitutionsByLoginBased();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch institutions');
            }
            return response;
        }
    });
}
// Leave Authorization hooks
export function useLeaveAuthorization(searchParams?: ApiSearchparams & { MI_Id?: string | number; UserId?: number }) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATIONS, 'list', searchParams ?? {}],
            queryFn: async () => {
                try {
                    // Call API with search params for pagination and filtering
                    const response = await getLeaveAuthorization({
                        ...searchParams,
                        UserId: 0,
                        MI_Id: searchParams?.MI_Id || HRMS_MI_ID
                    });
                    if (!response.success) {
                        throw new Error(response.message || 'Failed to fetch leave authorization');
                    }
                    // Extract list from response
                    let authList: LeaveAuthorization[] = [];
                    if (response.data) {
                        // Check for authorizationGrid (User provided specific structure)
                        if ((response.data as any).authorizationGrid && Array.isArray((response.data as any).authorizationGrid)) {
                            authList = (response.data as any).authorizationGrid
                                .map((item: any) => mapApiDataToLeaveAuthorization(item))
                                .filter((item: LeaveAuthorization | null): item is LeaveAuthorization => item !== null);
                        }
                        // Check if GridviewDetails contains the list
                        else if ((response.data as any).GridviewDetails && Array.isArray((response.data as any).GridviewDetails)) {
                            authList = (response.data as any).GridviewDetails.map((item: any) =>
                                mapApiDataToLeaveAuthorization(item)
                            ).filter((item: LeaveAuthorization | null): item is LeaveAuthorization => item !== null);
                        }
                        // Check if leavelistauth contains the list
                        else if ((response.data as any).leavelistauth && Array.isArray((response.data as any).leavelistauth)) {
                            authList = (response.data as any).leavelistauth
                                .map((item: any) => mapApiDataToLeaveAuthorization(item))
                                .filter((item: LeaveAuthorization | null): item is LeaveAuthorization => item !== null);
                        }
                        // If single record, convert it
                        else if ((response.data as any).HRMLA_Id > 0) {
                            const mapped = mapApiDataToLeaveAuthorization(response.data);
                            if (mapped) {
                                authList = [mapped];
                            }
                        }
                        // Check if data is directly an array
                        else if (Array.isArray(response.data)) {
                            authList = response.data
                                .map((item: any) => mapApiDataToLeaveAuthorization(item))
                                .filter((item: LeaveAuthorization | null): item is LeaveAuthorization => item !== null);
                        }
                    }
                    return {
                        success: true,
                        message: response.message || 'Leave authorization fetched successfully',
                        data: authList,
                        total: response.total || authList.length,
                        page: response.page || 1,
                        page_size: response.page_size || authList.length
                    };
                } catch (error: any) {
                    throw new Error(error?.message || 'Failed to fetch leave authorization');
                }
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATIONS]
            });
        }
    };
}
/**
 * Hook to fetch leave authorization dropdown options
 */
export function useLeaveAuthorizationDropdowns() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATIONS, 'dropdowns'],
            queryFn: async () => {
                try {
                    const dropdowns = await getLeaveAuthorizationDropdowns({
                        MI_Id: HRMS_MI_ID,
                        UserId: 0
                    });
                    return {
                        success: true,
                        data: dropdowns,
                        message: 'Dropdown data fetched successfully'
                    };
                } catch (error: any) {
                    throw new Error(error?.message || 'Failed to fetch dropdown data');
                }
            },
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
            retry: 1
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATIONS, 'dropdowns']
            });
        }
    };
}
/**
 * Hook to fetch a single leave authorization record for editing
 * @param HRLAON_Id - Leave authorization ID
 */
export function useLeaveAuthorizationForEdit(HRLAON_Id: number | null) {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATIONS, 'edit', HRLAON_Id],
        queryFn: async () => {
            if (!HRLAON_Id) {
                throw new Error('HRLAON_Id is required');
            }
            try {
                const response = await getLeaveAuthorizationForEdit(HRLAON_Id);
                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to fetch leave authorization data');
                }
                // Map API response to frontend format
                // Check if data is array and take first element
                const apiData = Array.isArray(response.data) ? response.data[0] : response.data;
                const mappedData = mapApiDataToLeaveAuthorization(apiData);

                if (!mappedData) {
                    throw new Error('Failed to parse leave authorization data');
                }
                return {
                    success: true,
                    data: apiData,
                    message: response.message || 'Leave authorization fetched successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to fetch leave authorization data');
            }
        },
        enabled: !!HRLAON_Id && HRLAON_Id > 0,
        retry: 1
    });
}
/**
 * Map frontend LeaveAuthorization format to API request format
 */
function mapLeaveAuthorizationToApiData(
    data: LeaveAuthorization | Omit<LeaveAuthorization, 'id' | 'createdAt'>,
    dropdownData: any,
    institutionsData?: any[]
): {
    hrla_Id: number;
    MI_Id: number;
    hrmG_Id: number;
    hrmgT_Id: number;
    hrmD_Id: number;
    hrmdeS_Id: number;
    hrmL_Id: number;
    userId: number;
    approvalUser: Array<{
        approval_HRME_Id: number;
        approvalLevelNo: number;
        approvalFinalFlag: boolean;
    }>;
} {
    // Find IDs from dropdown options based on names or values
    // form data might contain IDs (values) if coming from add/edit form, or Names (labels) if coming from table row
    // Resolve IDs from dropdown options based on names or values from the reactive form/table
    const gradeId = dropdownData?.grades?.find((g: any) => g.value == data.hrmG_GradeName || g.label === data.hrmG_GradeName)?.value || 0;
    const groupTypeId =
        dropdownData?.groupTypes?.find((g: any) => g.value == data.hrmgT_EmployeeGroupType || g.label === data.hrmgT_EmployeeGroupType)
            ?.value || 0;
    const departmentId =
        dropdownData?.departments?.find((d: any) => d.value == data.hrmD_DepartmentName || d.label === data.hrmD_DepartmentName)?.value ||
        0;
    const designationId =
        dropdownData?.designations?.find((d: any) => d.value == data.hrmdeS_DesignationName || d.label === data.hrmdeS_DesignationName)
            ?.value || 0;
    const leaveTypeId =
        dropdownData?.leaveTypes?.find((l: any) => l.value == data.hrmL_LeaveName || l.label === data.hrmL_LeaveName)?.value || 0;
    const approvalPersonId =
        dropdownData?.approvalPersons?.find((a: any) => a.value == data.hrmE_EmployeeFirstName || a.label === data.hrmE_EmployeeFirstName)
            ?.value || 0;

    // Resolve Institution ID
    let miId = HRMS_MI_ID;
    if (data.institution && institutionsData) {
        const selectedInst = institutionsData.find(
            (i: any) =>
                i.mI_Name === data.institution ||
                i.MI_Name === data.institution ||
                String(i.mI_Id) === data.institution ||
                String(i.MI_Id) === data.institution
        );
        if (selectedInst) {
            miId = selectedInst.mI_Id || selectedInst.MI_Id;
        }
    }

    return {
        hrla_Id: (data as any)._HRLA_Id || 0,
        MI_Id: miId,
        hrmG_Id: Number(gradeId),
        hrmgT_Id: Number(groupTypeId),
        hrmD_Id: Number(departmentId),
        hrmdeS_Id: Number(designationId),
        hrmL_Id: Number(leaveTypeId),
        userId: 0,
        approvalUser: [
            {
                approval_HRME_Id: Number(approvalPersonId),
                approvalLevelNo: Number(data.hrlaoN_SanctionLevelNo) || 0,
                approvalFinalFlag: !!data.finalFlag
            }
        ]
    };
}
export function useSaveLeaveAuthorization() {
    const queryClient = useQueryClient();
    const { data: dropdownData } = useLeaveAuthorizationDropdowns();
    const { data: institutionsData } = useInstitutionsByLoginBased();

    return useMutation<
        { success: boolean; data: LeaveAuthorization; message: string },
        Error,
        Omit<LeaveAuthorization, 'id' | 'createdAt'>
    >({
        mutationFn: async (data: Omit<LeaveAuthorization, 'id' | 'createdAt'>) => {
            if (!dropdownData?.data) {
                throw new Error('Dropdown data not loaded. Please wait...');
            }
            const apiData = mapLeaveAuthorizationToApiData(data, dropdownData.data, institutionsData?.data || []);
            console.log('🔵 [SERVER] Request Body:', JSON.stringify(apiData, null, 2));
            const response = await saveLeaveAuthorizationAPI(apiData);
            if (!response.success) {
                throw new Error(response.message || 'Failed to save leave authorization');
            }
            // Map response back to frontend format
            let mappedData: LeaveAuthorization | null = null;
            if (response.data) {
                mappedData = mapApiDataToLeaveAuthorization(response.data);
            }

            // If API returns success but no data (common in some legacy APIs), prevent error
            if (!mappedData && response.success) {
                // Return the input data as a placeholder
                // Note: This might contain IDs instead of Names until refetch
                mappedData = {
                    id: 0,
                    createdAt: new Date(),
                    ...data
                } as LeaveAuthorization;
            }

            if (!mappedData) {
                throw new Error('Failed to parse saved authorization data');
            }
            return {
                success: true,
                data: mappedData,
                message: response.message || 'Leave authorization saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                // Invalidate all queries starting with LEAVE_AUTHORIZATION key
                // This will include queries with specific MI_Id params
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATIONS]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to save leave authorization');
        }
    });
}
export function useUpdateLeaveAuthorization() {
    const queryClient = useQueryClient();
    const { data: dropdownData } = useLeaveAuthorizationDropdowns();
    return useMutation<{ success: boolean; data: LeaveAuthorization; message: string }, Error, LeaveAuthorization>({
        mutationFn: async (data: LeaveAuthorization) => {
            if (!data.id) {
                throw new Error('ID is required for update');
            }
            if (!dropdownData?.data) {
                throw new Error('Dropdown data not loaded. Please wait...');
            }
            const apiData = mapLeaveAuthorizationToApiData(data, dropdownData.data);
            const response = await saveLeaveAuthorizationAPI(apiData);
            if (!response.success) {
                throw new Error(response.message || 'Failed to update leave authorization');
            }
            // Map response back to frontend format
            let mappedData: LeaveAuthorization | null = null;
            if (response.data) {
                mappedData = mapApiDataToLeaveAuthorization(response.data);
            }

            // If API returns success but no data, prevent error
            if (!mappedData && response.success) {
                mappedData = {
                    ...data
                } as LeaveAuthorization;
            }

            if (!mappedData) {
                throw new Error('Failed to parse updated authorization data');
            }
            return {
                success: true,
                data: mappedData,
                message: response.message || 'Leave authorization updated successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATIONS]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to update leave authorization');
        }
    });
}
/**
 * Hook to delete a leave authorization
 */
export function useDeleteLeaveAuthorization() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: { HRLA_Id: number; HRLAON_Id: number }) => {
            try {
                const response = await deleteLeaveAuthorizationAPI(request);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to delete leave authorization');
                }
                return {
                    success: true,
                    message: response.message || 'Leave authorization deleted successfully'
                };
            } catch (error: any) {
                throw new Error(error?.message || 'Failed to delete leave authorization');
            }
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_AUTHORIZATIONS]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            console.error('Delete Authorization Failed:', error);
            // Error message from API is already in error.message
            toast.error(error.message || 'Failed to delete leave authorization');
        }
    });
}

// Leave Configuration hooks
import {
    getLeaveConfiguration,
    saveLeaveConfiguration as saveLeaveConfigurationAPI
} from '@/server/hrms/leave-management/leaveConfiguration/LeaveConfiguration';
import type {
    LeaveConfigurationData,
    LeaveConfigurationFormData,
    LeaveConfigurationSaveRequest
} from '@/types/hrms/leave-management/leaveConfiguration/leaveConfiguration';

/**
 * Map API response data to frontend LeaveConfigurationFormData format
 */
function mapApiDataToLeaveConfiguration(apiData: LeaveConfigurationData | null): LeaveConfigurationFormData | null {
    if (!apiData) {
        return null;
    }

    const lateLeave = apiData.hrlpC_LateLeaveFlag ?? apiData.HRLPC_LateLeaveFlag;
    const lateLop = apiData.hrlpC_LateLOPFlag ?? apiData.HRLPC_LateLOPFlag;
    const lateLeaveVal: 'leave' | 'lop' =
        lateLeave === true || String(lateLeave) === 'true'
            ? 'leave'
            : lateLop === true || String(lateLop) === 'true'
              ? 'lop'
              : 'leave';

    const absentLeave = apiData.hrlpC_AbsentLeaveFlag ?? apiData.HRLPC_AbsentLeaveFlag;
    const absentLop = apiData.hrlpC_AbsentLOPFlag ?? apiData.HRLPC_AbsentLOPFlag;
    const absentLeaveVal: 'leave' | 'lop' =
        absentLeave === true || String(absentLeave) === 'true'
            ? 'leave'
            : absentLop === true || String(absentLop) === 'true'
              ? 'lop'
              : 'leave';

    const toBool = (val: any, fallback = true): boolean => {
        if (val === undefined || val === null) return fallback;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1' || val.toLowerCase() === 'y';
        return Boolean(val);
    };

    const spOrGen = apiData.hrlpC_SpOrGen ?? apiData.HRLPC_SpOrGen ?? 'GEN';
    const spOrGenVal: 'SP' | 'GEN' = spOrGen === 'SP' ? 'SP' : 'GEN';

    return {
        id: apiData.hrlpC_Id ?? apiData.HRLPC_Id ?? 0,
        policy_name: apiData.hrlpC_LeavePolicyName ?? apiData.HRLPC_LeavePolicyName ?? '',
        proc_name: apiData.hrlpC_SPName ?? apiData.HRLPC_SPName ?? '',
        servic_name: apiData.hrlpC_ServiceName ?? apiData.HRLPC_ServiceName ?? '',
        late_flag: toBool(apiData.hrlpC_LateInFlag ?? apiData.HRLPC_LateInFlag),
        Late_Time: String(apiData.hrlpC_LateInTime ?? apiData.HRLPC_LateInTime ?? ''),
        numlate_flag: toBool(apiData.hrlpC_NoOfLatesFag ?? apiData.HRLPC_NoOfLatesFag ?? apiData.hrlpC_NoOfLatesFlag ?? apiData.HRLPC_NoOfLatesFlag),
        Late_num: String(apiData.hrlpC_NoOfLates ?? apiData.HRLPC_NoOfLates ?? ''),
        Early: toBool(apiData.hrlpC_EarlyOutFlag ?? apiData.HRLPC_EarlyOutFlag),
        Early_Time: String(apiData.hrlpC_EarlyOutTime ?? apiData.HRLPC_EarlyOutTime ?? ''),
        Time_flag: toBool(apiData.hrlpC_CummulativeTimeFlag ?? apiData.HRLPC_CummulativeTimeFlag),
        cum_time: String(apiData.hrlpC_CummulativeTime ?? apiData.HRLPC_CummulativeTime ?? ''),
        Aftr_cum_time: String(apiData.hrlpC_AfterCummulativeTime ?? apiData.HRLPC_AfterCummulativeTime ?? ''),
        carry_flag: toBool(apiData.hrlpC_NoOfLatesCFFlag ?? apiData.HRLPC_NoOfLatesCFFlag),
        sufix_flag: toBool(apiData.hrlpC_LeavePrefixSuffixFlag ?? apiData.HRLPC_LeavePrefixSuffixFlag),
        holiday_inc_flag: toBool(apiData.hrlpC_IncludeHolidayFlag ?? apiData.HRLPC_IncludeHolidayFlag),
        HRLPC_LateLeaveFlag: lateLeaveVal,
        sporgen_flag: spOrGenVal,
        HRLPC_AbsentLeaveFlag: absentLeaveVal
    };
}

/**
 * Map frontend LeaveConfigurationFormData to API request format
 */
function mapLeaveConfigurationToApiData(data: LeaveConfigurationFormData): LeaveConfigurationSaveRequest {
    const isLateLeave = data.HRLPC_LateLeaveFlag === 'leave';
    const isAbsentLeave = data.HRLPC_AbsentLeaveFlag === 'leave';

    return {
        HRLPC_Id: data.id || 0,
        MI_Id: HRMS_MI_ID,
        HRLPC_LeavePolicyName: data.policy_name,
        HRLPC_SPName: data.proc_name ?? '',
        HRLPC_ServiceName: data.servic_name,
        HRLPC_LateInFlag: data.late_flag,
        HRLPC_LateInTime: data.Late_Time,
        HRLPC_EarlyOutFlag: data.Early,
        HRLPC_EarlyOutTime: data.Early_Time,
        HRLPC_CummulativeTimeFlag: data.Time_flag,
        HRLPC_CummulativeTime: data.cum_time,
        HRLPC_AfterCummulativeTime: data.Aftr_cum_time,
        HRLPC_NoOfLatesCFFlag: data.carry_flag,
        HRLPC_LeavePrefixSuffixFlag: data.sufix_flag,
        HRLPC_IncludeHolidayFlag: data.holiday_inc_flag,
        HRLPC_LateLeaveFlag: isLateLeave,
        HRLPC_LateLOPFlag: !isLateLeave,
        HRLPC_NoOfLatesFag: data.numlate_flag,
        HRLPC_NoOfLates: Number(data.Late_num) || 0,
        HRLPC_SpOrGen: data.sporgen_flag,
        HRLPC_AbsentLOPFlag: !isAbsentLeave,
        HRLPC_AbsentLeaveFlag: isAbsentLeave
    };
}

/**
 * Hook to fetch leave configuration
 */
export function useLeaveConfiguration() {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.LEAVE_CONFIGURATION, 'detail'],
            queryFn: async () => {
                try {
                    const response = await getLeaveConfiguration();
                    if (!response.success) {
                        throw new Error(response.message || 'Failed to fetch leave configuration');
                    }

                    const mappedData = mapApiDataToLeaveConfiguration(response.data);

                    return {
                        success: true,
                        data: mappedData,
                        message: response.message || 'Leave configuration fetched successfully'
                    };
                } catch (error: any) {
                    throw new Error(error?.message || 'Failed to fetch leave configuration');
                }
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.LEAVE_CONFIGURATION]
            });
        }
    };
}

/**
 * Hook to save leave configuration
 */
export function useSaveLeaveConfiguration() {
    const queryClient = useQueryClient();
    return useMutation<{ success: boolean; data: any; message: string }, Error, LeaveConfigurationFormData>({
        mutationFn: async (data: LeaveConfigurationFormData) => {
            const apiData = mapLeaveConfigurationToApiData(data);
            const response = await saveLeaveConfigurationAPI(apiData);
            if (!response.success) {
                throw new Error(response.message || 'Failed to save leave configuration');
            }

            return {
                success: true,
                data: response.data,
                message: response.message || 'Leave configuration saved successfully'
            };
        },
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.LEAVE_CONFIGURATION]
                });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save leave configuration');
        }
    });
}
