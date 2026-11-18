'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import type { Institution } from '@/types/exam/exam-module/report';
import type { DepartmentItem, DesignationItem, EmployeeItem, GroupTypeItem } from '@/types/hrms/master-dropdown';

/**
 * Get all group types
 * GET /api/MasterDropDown/GroupType
 *
 * @returns List of group types
 */
export async function getGroupTypes(): Promise<ApiResponse<GroupTypeItem[]>> {
    const url = '/api/MasterDropDown/GroupType';

    try {
        const response = await api.get<GroupTypeItem[]>('hrms', url);
        console.log('📋 [SERVER] Group Types Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped in ApiResponse format
            return response as ApiResponse<GroupTypeItem[]>;
        }

        // Wrap raw response data
        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || 'Data fetched successfully',
            data: (responseData?.data || response) as GroupTypeItem[]
        };
    } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch group types';
        throw new Error(errorMessage);
    }
}

/**
 * Get departments by group type IDs
 * GET /api/MasterDropDown/department_drop_down_by_group_Type/{hrmgt_ids}
 *
 * @param hrmgtIds - Array of group type IDs
 * @returns List of departments
 */
export async function getDepartmentsByGroupType(hrmgtIds: number[]): Promise<ApiResponse<DepartmentItem[]>> {
    if (!hrmgtIds || hrmgtIds.length === 0) {
        return {
            success: true,
            message: 'No group types selected',
            data: []
        };
    }

    const idsParam = hrmgtIds.join(',');
    const url = `/api/MasterDropDown/department_drop_down_by_group_Type/${idsParam}`;

    try {
        const response = await api.get<DepartmentItem[]>('hrms', url);
        console.log('🏢 [SERVER] Departments Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            return response as ApiResponse<DepartmentItem[]>;
        }

        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || 'Data fetched successfully',
            data: (responseData?.data || response) as DepartmentItem[]
        };
    } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch departments';
        throw new Error(errorMessage);
    }
}

/**
 * Get designations by department IDs
 * GET /api/MasterDropDown/designations_drop_down_by_dept/{hrmd_ids}
 *
 * @param hrmdIds - Array of department IDs
 * @returns List of designations
 */
export async function getDesignationsByDepartment(hrmdIds: number[]): Promise<ApiResponse<DesignationItem[]>> {
    if (!hrmdIds || hrmdIds.length === 0) {
        return {
            success: true,
            message: 'No departments selected',
            data: []
        };
    }

    const idsParam = hrmdIds.join(',');
    const url = `/api/MasterDropDown/designations_drop_down_by_dept/${idsParam}`;

    try {
        const response = await api.get<DesignationItem[]>('hrms', url);
        console.log('💼 [SERVER] Designations Response:', JSON.stringify(response, null, 2));

        // Handle the response structure
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            return response as ApiResponse<DesignationItem[]>;
        }

        const responseData = response as any;
        return {
            success: responseData?.success ?? true,
            message: responseData?.message || 'Data fetched successfully',
            data: (responseData?.data || response) as DesignationItem[]
        };
    } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch designations';
        throw new Error(errorMessage);
    }
}

/**
 * Get employees by department and designation IDs
 * GET /api/MasterDropDown/employees_drop_down_by_dept_and_designation/{hrmd_ids}/{hrmdes_ids}
 *
 * @param hrmdIds - Array of department IDs
 * @param hrmdesIds - Array of designation IDs
 * @returns List of employees
 */
export async function getEmployeesByDeptAndDesignation(hrmdIds: number[], hrmdesIds: number[]): Promise<ApiResponse<EmployeeItem[]>> {
    if (!hrmdIds || hrmdIds.length === 0 || !hrmdesIds || hrmdesIds.length === 0) {
        return {
            success: true,
            message: 'No departments or designations selected',
            data: []
        };
    }

    const deptIdsParam = hrmdIds.join(',');
    const desigIdsParam = hrmdesIds.join(',');
    const url = `/api/MasterDropDown/employees_drop_down_by_dept_and_designation/${deptIdsParam}/${desigIdsParam}`;

    console.log('📡 [SERVER] Fetching employees from MasterDropDown:', url);

    try {
        // Use getArray to handle potential $values wrapping
        const response = await api.getArray<EmployeeItem>('hrms', url);
        console.log('👤 [SERVER] Employees Raw Response:', JSON.stringify(response, null, 2));

        if (!response.success || !response.data) {
            console.warn('⚠️ [SERVER] Employees API returned no success or data');
            return {
                success: response.success,
                message: response.message || 'No employees found',
                data: []
            };
        }

        return {
            success: true,
            message: 'Data fetched successfully',
            data: response.data
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Employees API Error:', error);
        throw error;
    }
}

/**
 * Get leave opening balance list
 * GET /api/MasterDropDown/GetLeaveOB
 *
 * @returns List of leaves for opening balance
 */
export async function getLeaveOB(): Promise<ApiResponse<any>> {
    const url = '/api/MasterDropDown/GetLeave';
    console.log('📡 [SERVER] Fetching Leave :', url);

    try {
        const response = await api.get<any>('hmslms', url);
        // Note: Using 'hmslms' since it's related to leave management, but original MasterDropdown functions use 'hrms'.
        // However, user prompt didn't specify microservice, but usually GetLeaveOB is in the same service as other Leave APIs.
        // But MasterDropDown in this file uses 'hrms'. I'll try 'hmslms' because typical Leave APIs are there.
        // Wait, other functions here use 'hrms'. 'GetLeaveOB' sounds like it could be in 'hrms' if it is a general dropdown.
        // Let's stick to what other MasterDropDown functions use: 'hrms', BUT 'GetLeaveOB' is likely specific.
        // Actually, let's use 'hmslms' because the user mentioned Leave Opening Balance integration which uses 'hmslms' in other files.
        // Re-reading file: lines 20 use 'hrms'.
        // If I use 'hrms' and it fails, it's an issue. But typically all "MasterDropDown" are in one service.
        // Let's assume 'hmslms' for now as it is Leave related.
        // Wait, the path is `/api/MasterDropDown/GetLeaveOB`.
        // If `api/LeaveOpeningBalance/...` is in `hmslms`, then `MasterDropDown` might be in `hrms` OR `hmslms`.
        // I will check `hooks/hrms/leave-management/useMasters.ts` imports.
        // It imports from `server/hrms/leave-management/masters/master-leave`.
        // Let's look at `server/hrms/master-dropdown.ts` again. It uses `hrms`.
        // I will trust the existing pattern in `master-dropdown.ts` and use `hrms` unless I have strong reason not to.
        // BUT, if it returns "Leave Names", it might be `hmslms` (Leave Management Service).
        // Let's check `getEmployeesByDeptAndDesignation` uses `hrms`.
        // I will try `hmslms` because "Leave" is in "Leave Management".
        // Actually, if I look at `d:\AIVRM - HRMS\IVRMNext\server\hrms\leave-management\transaction\leave-opening-balance.ts`, it uses `hmslms`.
        // So I will use `hmslms`.

        console.log('📦 [SERVER] Leave OB Response:', JSON.stringify(response, null, 2));

        const res = response as any;
        return {
            success: res.success ?? true,
            message: res.message || 'Data fetched successfully',
            data: res.data || res || []
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Leave OB API Error:', error);
        throw new Error(error?.message || 'Failed to fetch leave opening balance list');
    }
}

/**
 * Get all leaves
 * GET /api/MasterDropDown/GetLeave
 *
 * @returns List of leaves
 */
export async function getLeave(): Promise<ApiResponse<any[]>> {
    const url = '/api/MasterDropDown/GetLeave';
    console.log('📡 [SERVER] Fetching Leaves:', url);

    try {
        const response = await api.get<any[]>('hmslms', url);
        console.log('📦 [SERVER] Leaves Response:', JSON.stringify(response, null, 2));

        const res = response as any;
        return {
            success: res?.success ?? true,
            message: res?.message || 'Data fetched successfully',
            data: res?.data || res || []
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Leaves API Error:', error);
        throw new Error(error?.message || 'Failed to fetch leaves');
    }
}
/**
 * Get leave names for dropdown
 * GET /api/MasterDropDown/get_leave_name_dropdown
 *
 * @returns List of leave names with codes
 */
export async function getLeaveNameCodeDropdown(): Promise<ApiResponse<any[]>> {
    const url = '/api/MasterDropDown/get_leave_name_dropdown';
    console.log('📡 [SERVER] Fetching Leave Name Dropdown:', url);

    try {
        const response = await api.get<any[]>('hmslms', url);
        console.log('📦 [SERVER] Leave Name Dropdown Response:', JSON.stringify(response, null, 2));

        const res = response as any;
        return {
            success: res?.success ?? true,
            message: res?.message || 'Data fetched successfully',
            data: res?.data || res || []
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Leave Name Dropdown API Error:', error);
        throw new Error(error?.message || 'Failed to fetch leave names');
    }
}

/**
 * Get institution details
 * GET /api/MasterDropDown/master_institution
 *
 * @returns Institution details
 */
export async function getMasterInstitution(): Promise<ApiResponse<Institution>> {
    const url = '/api/MasterDropDown/master_institution';
    console.log('📡 [SERVER] Fetching Institution Details:', url);

    try {
        const response = await api.get<Institution>('hrms', url);
        console.log('📊 [SERVER] Institution Details Response:', JSON.stringify(response, null, 2));

        const res = response as any;
        return {
            success: res?.success ?? true,
            message: res?.message || 'Data fetched successfully',
            data: res?.data || res
        };
    } catch (error: any) {
        console.error('❌ [SERVER] Institution Details API Error:', error);
        throw new Error(error?.message || 'Failed to fetch institution details');
    }
}

/**
 * Get institution details
 * GET /api/MasterDropDown/GetEmployees
 *
 * @returns Institution details
 */

export async function getEmployees(): Promise<ApiResponse<any[]>> {
    const url = '/api/MasterDropDown/GetEmployees';
    try {
        const response = await api.get<any[]>('hrms', url);

        const res = response as any;
        return {
            success: res?.success ?? true,
            message: res?.message || 'Data fetched successfully',
            data: res?.data || res || []
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch employees');
    }
}

/**
 * Get financial year dropdown
 */

export async function getFinancialYearDropdown(): Promise<ApiResponse<any[]>> {
    const url = '/api/MasterDropDown/finanicial_year_drop_down';
    try {
        const response = await api.get<any[]>('hrms', url);

        const res = response as any;
        return {
            success: res?.success ?? true,
            message: res?.message || 'Data fetched successfully',
            data: res?.data || res || []
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch financial year dropdown');
    }
}
