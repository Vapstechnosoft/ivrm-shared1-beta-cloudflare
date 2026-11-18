'use client';

import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// time-table-generation
import { getAcademicYear, getCategory, getTimeTableGenerationGridData } from '@/server/timetable/transactions/timetablegeneration';

// deputation
import {
    getAbsentStaff,
    getAllDetailsViewRecords2,
    getAcademicYearData as getDeputationAcademicYearData,
    getDeputationDetails,
    getFreeStaffDets,
    getPeriodAlloted,
    getViewAbsent,
    getViewDeputation,
    getViewRecordsPopup9,
    saveDeputationDetails
} from '@/server/timetable/transactions/deputation';
import type {
    IAbsentStaffPayload,
    IFreeStaffPayload,
    IPeriodAllotedPayload,
    ISaveDeputationPayload,
    IViewAbsentPayload,
    IViewDeputationPayload,
    IViewRecords2Payload,
    IViewRecordsPopup9Payload
} from '@/types/timetable/Transaction/deputation';

// manual-Period-insersion
import {
    getManualPeriodInsertionMasters,
    getManualPeriodInsertionReportData,
    getSectionsByClass as getSectionsByClassManual,
    saveManualPeriodInsertion
} from '@/server/timetable/transactions/manualperiodinsertion';
import type { ManualPeriodInsertionMasters, Section as ManualSection } from '@/types/timetable/Transaction/manualperiodinsertion';

// staff-replacement-existing-to-new
import {
    getSectionDropdown as getSectionDropdownExisting,
    getSectionsByClass as getSectionsByClassExisting,
    getStaffReplacementExistingToNewMasters,
    getStaffReplacementGridData,
    getStaffReplacementInitialDetails,
    saveStaffReplacementExistingToNew
} from '@/server/timetable/transactions/staffreplacementexistingtonew';

// staffPeriodTransfer
import {
    getSectionsByClass as getSectionsByClassTransfer,
    getStaffPeriodDetails,
    getStaffPeriodTransferMasters,
    getStaffPeriodTransferReport,
    saveStaffPeriodTransfer
} from '@/server/timetable/transactions/staffperiodtransfer';
import type {
    SaveStaffPeriodTransferPayload,
    StaffPeriodTransferMasters,
    StaffPeriodTransferReportData,
    Section as TransferSection
} from '@/types/timetable/Transaction/staffperiodtransfer';

// staff-replacement-in-unallocated-period
import {
    TTStaffReplacementInUnallocatedPeriodReport,
    getStaffReplacementUnallocatedPeriodNewMasters,
    saveStaffReplacementInUnallocatedPeriod
} from '@/server/timetable/transactions/staffreplacementinunallocatedperiod';

// staff-replacement-In-their-timeTable
import {
    getPossiblePeriods,
    getStaffReplacementExistingToNewMasters as getStaffReplacementExistingToNewMastersTheir,
    getStaffReplacementReport,
    saveStaffReplacement
} from '@/server/timetable/transactions/staffreplacementintheirtimetable';

// classSectionActions
import { getTransactionCategoryDropdown, getTransactionClassDropdown } from '@/server/timetable/transactions/classSectionActions';

// ================= time-table-generation =================
export const useGenerationMasters = () => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_GENERATION_MASTERS],
            queryFn: async () => {
                const [yearsResponse, categoriesResponse] = await Promise.all([getAcademicYear({}), getCategory({})]);
                return {
                    years: yearsResponse.data ?? [],
                    categories: categoriesResponse.data ?? []
                };
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_GENERATION_MASTERS]
            });
        }
    };
};
export const useTimeTableGenerationGridData = (searchParams: any) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_GENERATION_MASTERS, 'grid', searchParams],
            queryFn: async () => {
                const res = await getTimeTableGenerationGridData(searchParams);
                return res.data || res;
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_GENERATION_MASTERS]
            });
        }
    };
};

// ================= deputation =================

export const useTimeTableAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_ACADEMICYEAR, searchParams ?? {}],
            queryFn: async () => getDeputationAcademicYearData(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_ACADEMICYEAR]
            });
        }
    };
};

export const useDeputationDetails = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.DEPUTATION_MASTERS],
        queryFn: async () => {
            const res = await getDeputationDetails();
            return res.data || res;
        }
    });
};

export const useDeputationMasters = useDeputationDetails;

export const useAbsentStaffList = (payload: IAbsentStaffPayload, enabled = true) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.DEPUTATION_ABSENT_STAFF, payload],
        queryFn: async () => {
            const res = await getAbsentStaff(payload);
            return res.data || res;
        },
        enabled: enabled && !!payload.TTSD_Date && !!payload.ASMAY_Id
    });
};

export const usePeriodAlloted = (payload: IPeriodAllotedPayload, enabled = true) => {
    return useQuery({
        queryKey: ['DEPUTATION_PERIOD_ALLOTED', payload],
        queryFn: async () => {
            const res = await getPeriodAlloted(payload);
            return res.data || res;
        },
        enabled: enabled && !!payload.HRME_Id && !!payload.TTSD_Date && !!payload.ASMAY_Id
    });
};

export const useFreeStaffDetails = (payload: IFreeStaffPayload, enabled = true) => {
    return useQuery({
        queryKey: ['DEPUTATION_FREE_STAFF', payload],
        queryFn: async () => {
            const res = await getFreeStaffDets(payload);
            return res.data || res;
        },
        enabled: enabled && !!payload.TTMP_Id && !!payload.TTSD_Date && !!payload.ASMAY_Id
    });
};

export const useAllDetailsViewRecords2 = (payload: IViewRecords2Payload, enabled = true) => {
    return useQuery({
        queryKey: ['DEPUTATION_VIEW_RECORDS_2', payload],
        queryFn: async () => {
            const res = await getAllDetailsViewRecords2(payload);
            return res.data || res;
        },
        enabled: enabled && !!payload.HRME_Id && !!payload.ASMAY_Id
    });
};

export const useViewRecordsPopup9 = (payload: IViewRecordsPopup9Payload, enabled = true) => {
    return useQuery({
        queryKey: ['DEPUTATION_VIEW_RECORDS_9', payload],
        queryFn: async () => {
            const res = await getViewRecordsPopup9(payload);
            return res.data || res;
        },
        enabled: enabled && !!payload.HRME_Id && !!payload.ASMAY_Id && !!payload.TTMD_Id
    });
};

export const useViewDeputation = (payload: IViewDeputationPayload, enabled = true) => {
    return useQuery({
        queryKey: ['DEPUTATION_VIEW_DEPUTATION', payload],
        queryFn: async () => {
            const res = await getViewDeputation(payload);
            return res.data || res;
        },
        enabled: enabled && !!payload.HRME_Id && !!payload.ASMAY_Id
    });
};

export const useViewAbsent = (payload: IViewAbsentPayload, enabled = true) => {
    return useQuery({
        queryKey: ['DEPUTATION_VIEW_ABSENT', payload],
        queryFn: async () => {
            const res = await getViewAbsent(payload);
            return res.data || res;
        },
        enabled: enabled && !!payload.HRME_Id && !!payload.ASMAY_Id
    });
};

export const useSaveDeputationDetails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: ISaveDeputationPayload) => {
            return await saveDeputationDetails(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TIMETABLE_QUERY_KEYS.DEPUTATION_MASTERS] });
            queryClient.invalidateQueries({ queryKey: ['DEPUTATION_PERIOD_ALLOTED'] });
            queryClient.invalidateQueries({ queryKey: ['DEPUTATION_FREE_STAFF'] });
        }
    });
};

// ================= manual-Period-insersion =================
export const useManualPeriodMasters = () => {
    return useQuery<ManualPeriodInsertionMasters>({
        queryKey: ['MANUAL_PERIOD_MASTERS'],
        queryFn: async () => await getManualPeriodInsertionMasters()
    });
};
export const useManualSectionsByClass = (asmcL_Id: number) => {
    return useQuery<ManualSection[]>({
        queryKey: ['MANUAL_PERIOD_SECTIONS', asmcL_Id],
        queryFn: async () => {
            const res = await getSectionsByClassManual(asmcL_Id);
            return res.data || [];
        },
        enabled: !!asmcL_Id
    });
};
export const useManualPeriodInsertionReport = (payload: any) => {
    return useQuery({
        queryKey: ['manualPeriodInsertionReport', payload],
        queryFn: async () => {
            const res = await getManualPeriodInsertionReportData(payload);
            return res.data || res;
        },
        enabled: !!payload && !!payload.asmaY_Id && !!payload.asmcL_Id && !!payload.asms_Id,
        staleTime: 0,
        refetchOnWindowFocus: false
    });
};
export const useSaveManualPeriodInsertion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveManualPeriodInsertion(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manualPeriodInsertionReport'] });
        }
    });
};

// ================= staff-replacement-existing-to-new =================
export const useStaffReplacementExistingToNewMasters = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_MASTERS],
        queryFn: getStaffReplacementExistingToNewMasters
    });
};
export const useStaffReplacementSectionsByClass = (asmcL_Id: number) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_SECTIONS, asmcL_Id],
        queryFn: async () => {
            const res = await getSectionsByClassExisting(asmcL_Id);
            return res.data || [];
        },
        enabled: !!asmcL_Id
    });
};
export const useSectionDropdown = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_SECTIONS],
        queryFn: async () => {
            const res = await getSectionDropdownExisting();
            return res.data || [];
        }
    });
};
export const useStaffReplacementInitialDetails = (id = 0) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_MASTERS, 'details', id],
        queryFn: async () => {
            const res = await getStaffReplacementInitialDetails(id);
            return res.data || res;
        }
    });
};
export const useSaveStaffReplacementExistingToNew = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveStaffReplacementExistingToNew,
        onSuccess: (data: any) => {
            const isSuccess = data?.returnval === true || data?.success === true || data?.data === true;
            if (isSuccess) {
                queryClient.invalidateQueries({ queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_GRID_DATA] });
            }
        }
    });
};
export const useStaffReplacementGridData = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_GRID_DATA, searchParams ?? {}],
            queryFn: async () => {
                const res = await getStaffReplacementGridData(searchParams);
                return res;
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_GRID_DATA]
            });
        }
    };
};

// ================= staffPeriodTransfer =================
export const useStaffPeriodTransferMasters = () => {
    return useQuery<StaffPeriodTransferMasters>({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_TRANSFER_MASTERS],
        queryFn: async () => await getStaffPeriodTransferMasters()
    });
};
export const useStaffTransferSectionsByClass = (asmcL_Id: number) => {
    return useQuery<TransferSection[]>({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_TRANSFER_SECTIONS, asmcL_Id],
        queryFn: async () => {
            const res = await getSectionsByClassTransfer(asmcL_Id);
            return res.data || [];
        },
        enabled: !!asmcL_Id
    });
};
export const useStaffPeriodTransferReport = (payload: {
    asmaY_Id: number | string;
    hrmE_Id: number | string;
}) => {
    return useQuery<StaffPeriodTransferReportData | null>({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_PERIOD_DETAILS, payload.asmaY_Id, payload.hrmE_Id],
        queryFn: async () => {
            const res = await getStaffPeriodTransferReport(payload);
            return (res?.data || res) as StaffPeriodTransferReportData;
        },
        enabled: !!payload.asmaY_Id && !!payload.hrmE_Id && payload.asmaY_Id !== '0' && payload.hrmE_Id !== '0'
    });
};
export const useSaveStaffPeriodTransfer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: SaveStaffPeriodTransferPayload | any) => await saveStaffPeriodTransfer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TIMETABLE_QUERY_KEYS.STAFF_PERIOD_DETAILS] });
        }
    });
};
export const useStaffPeriodDetails = (payload: {
    asmaY_Id: number;
    hrmE_Id: number;
    asmcL_Id: number;
    asms_Id: number;
    ismS_Id: number;
}) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_PERIOD_DETAILS, payload],
        queryFn: async () => {
            const res = await getStaffPeriodDetails(payload);
            return res.data || [];
        },
        enabled: !!payload.asmaY_Id && !!payload.hrmE_Id
    });
};

// ================= staff-replacement-in-unallocated-period =================
export const useStaffReplacementInUnallocatedPeriodMasters = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_THIER_TIMETABLE],
        queryFn: async () => await getStaffReplacementUnallocatedPeriodNewMasters()
    });
};
export const useTTStaffReplacementInUnallocatedPeriodReport = (hrmE_Id: number) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_UNALLOCATED_PERIOD_REPORT, hrmE_Id],
        queryFn: async () => {
            const res = await TTStaffReplacementInUnallocatedPeriodReport(hrmE_Id);
            return res;
        },
        enabled: !!hrmE_Id
    });
};
export const useSaveStaffReplacementInUnallocatedPeriod = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => await saveStaffReplacementInUnallocatedPeriod(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_UNALLOCATED_PERIOD_REPORT] });
        }
    });
};

// ================= staff-replacement-In-their-timeTable =================
export const useStaffReplacementInTheirTimetableMasters = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_THIER_TIMETABLE],
        queryFn: async () => await getStaffReplacementExistingToNewMastersTheir()
    });
};
export const useStaffReplacementInTheirTimetableReport = (payload: { hrmE_Id: string }) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_THIER_TIMETABLE, 'report', payload.hrmE_Id],
        queryFn: async () => {
            const res = await getStaffReplacementReport(payload);
            return res.data || res;
        },
        enabled: !!payload.hrmE_Id
    });
};
export const useStaffReplacementInTheirTimetablePossiblePeriods = () => {
    return useMutation({
        mutationFn: async (payload: any) => {
            const res = await getPossiblePeriods(payload);
            return res.data || res;
        }
    });
};
export const useSaveStaffReplacementInTheirTimetable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => await saveStaffReplacement(payload),
        onSuccess: (data: any) => {
            const isSuccess = data?.returnval === true || data?.success === true || data?.data === true;
            if (isSuccess) {
                queryClient.invalidateQueries({ queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_IN_THIER_TIMETABLE, 'report'] });
            }
        }
    });
};

// ================= classSectionActions =================
export const useTransactionCategoryDropdown = () => {
    const queryClient = useQueryClient();
    return {
        ...useQuery<any[]>({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_CLASS_SECTION_REPORT, TIMETABLE_QUERY_KEYS.TT_TXN_CATEGORY_DROPDOWN],
            queryFn: async () => {
                const res = await getTransactionCategoryDropdown();
                return Array.isArray(res) ? res : (res?.data ?? []);
            },
            initialData: []
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_CLASS_SECTION_REPORT, TIMETABLE_QUERY_KEYS.TT_TXN_CATEGORY_DROPDOWN]
            })
    };
};
export const useTransactionClassDropdown = () => {
    const queryClient = useQueryClient();
    return {
        ...useQuery<any[]>({
            queryKey: [TIMETABLE_QUERY_KEYS.TT_CLASS_SECTION_REPORT, TIMETABLE_QUERY_KEYS.TT_TXN_CLASS_DROPDOWN],
            queryFn: async () => {
                const res = await getTransactionClassDropdown();
                return Array.isArray(res) ? res : (res?.data ?? []);
            },
            initialData: []
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.TT_CLASS_SECTION_REPORT, TIMETABLE_QUERY_KEYS.TT_TXN_CLASS_DROPDOWN]
            })
    };
};
