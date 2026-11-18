import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import { getClassDetails, getSectionDetailsTT, getTimeTableCategoryDropDownDetails } from '@/server/timetable/reports/classwisett';
import { getAcademicYear, getDeputationReportDetails, getDeputationReportLoadData } from '@/server/timetable/reports/deputationreport';
import {
    getstaffwiseWorkingHoursAcademicYear,
    getstaffwiseWorkingHoursReport,
    getstaffwiseWorkingHoursStaffDD
} from '@/server/timetable/reports/stafWiseWrokingHours';
import { getStaffReplacementClassSectionReport } from '@/server/timetable/reports/staff-replacement-class-section';
import { getstaffdropdowndatattstaffreport } from '@/server/timetable/reports/staffwisett';
import { getuseTimeTableClassDropdownData, getuseTimeTableSectionDropdownData } from '@/server/timetable/reports/subjectwisett';

import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSectionDropDown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_SECTIONREPORT, searchParams ?? {}],
            queryFn: async () => getSectionDetailsTT(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_SECTIONREPORT]
            });
        }
    };
};

export const staffdropdowndatattstaffreport = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.STAFF_DROPDOWN_STAFFREPORT, searchParams ?? {}],
            queryFn: async () => getstaffdropdowndatattstaffreport(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.STAFF_DROPDOWN_STAFFREPORT]
            });
        }
    };
};
export const useClassDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN, searchParams ?? {}],
            queryFn: async () => getClassDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN]
            });
        }
    };
};

export const useDeputationAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.DEPUTATION_ACADEMIC_YEAR, searchParams ?? {}],
            queryFn: async () => getAcademicYear(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.DEPUTATION_ACADEMIC_YEAR]
            });
        }
    };
};

export const useDeputationReportLoadData = () => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.DEPUTATION_MASTERS],
        queryFn: getDeputationReportLoadData
    });
};

export const useDeputationReportDetails = () => {
    return useMutation({
        mutationFn: (data: any) => getDeputationReportDetails(data)
    });
};

export const staffwiseWorkingHoursStaffData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.STAFF_WISE_WORKING_HOURS_REPORT],
            queryFn: async () => getstaffwiseWorkingHoursStaffDD(),
            select: (res: any) => {
                const rawData = res?.data ?? res;
                let potentialList =
                    rawData?.stafflist ??
                    rawData?.staffList ??
                    rawData?.staffData ??
                    rawData?.$values ??
                    (Array.isArray(rawData) ? rawData : []);

                if (!Array.isArray(potentialList) && (potentialList as any)?.$values) {
                    potentialList = (potentialList as any).$values;
                }

                return Array.isArray(potentialList) ? potentialList : [];
            },
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.STAFF_WISE_WORKING_HOURS_REPORT]
            });
        }
    };
};

export const useTimeTableCategoryDropDownClassWise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CATEGORY_DROPDOWNDATA_TT, searchParams ?? {}],
            queryFn: async () => getTimeTableCategoryDropDownDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_CATEGORY_DROPDOWNDATA_TT]
            });
        }
    };
};

export const useTimeTableClassDropdown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN, searchParams ?? {}],
            queryFn: async () => getuseTimeTableClassDropdownData(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN]
            });
        }
    };
};

export const useTimeTableSectionDropdown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_SECTIONDROPDOWN, searchParams ?? {}],
            queryFn: async () => getuseTimeTableSectionDropdownData(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_TT_CLASSDROPDOWN]
            });
        }
    };
};

// export const staffwiseWorkingHoursStaffData = (searchParams?: ApiSearchparams) => {
//     const queryClient = useQueryClient();

//     return {
//         ...useQuery({
//             queryKey: [TIMETABLE_QUERY_KEYS.STAFF_WISE_WORKING_HOURS_REPORT, searchParams ?? {}],
//             queryFn: async () => getstaffwiseWorkingHoursStaffDD(),
//             select: (res: any) => {
//                 const rawList =
//                     res?.data?.stafflist ??
//                     res?.data?.staffList ??
//                     res?.stafflist ??
//                     res?.staffList ??
//                     [];

//                 // Some APIs return { $values: [...] }
//                 if (rawList?.$values && Array.isArray(rawList.$values)) return rawList.$values;

//                 return Array.isArray(rawList) ? rawList : [];
//             },
//             staleTime: 0
//         }),

//         refetchAll: () => {
//             return queryClient.invalidateQueries({
//                 queryKey: [TIMETABLE_QUERY_KEYS.STAFF_WISE_WORKING_HOURS_REPORT]
//             });
//         }
//     };
// };

export const staffwiseWorkingHoursAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.STAFF_WISE_WORKING_HOURS_ACADEMIC_YEAR, searchParams ?? {}],
            queryFn: async () => getstaffwiseWorkingHoursAcademicYear(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.STAFF_WISE_WORKING_HOURS_ACADEMIC_YEAR]
            });
        }
    };
};

export const staffwiseWorkingHoursReportDetails = () => {
    return useMutation({
        mutationFn: (data: any) => getstaffwiseWorkingHoursReport(data)
    });
};

// export const useStaffReplacementClassSectionReportDetails = () => {
//     return useMutation({
//         mutationFn: (data: any) => getStaffReplacementClassSectionReport(data)
//     });
// };

// export const useStaffReplacementClassSectionReportDetails = () => {
//     const queryClient = useQueryClient();

//     return {
//         ...useQuery({
//             queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_CLASS_SECTION_REPORT],
//             queryFn: async () => getStaffReplacementClassSectionReport(),
//             staleTime: 0
//         }),

//         refetchAll: () => {
//             return queryClient.invalidateQueries({
//                 queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_CLASS_SECTION_REPORT]
//             });
//         }
//     };
// };

export const useStaffReplacementClassSectionReportDetails = (payload: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_CLASS_SECTION_REPORT, payload],
            queryFn: async () => getStaffReplacementClassSectionReport(payload),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.STAFF_REPLACEMENT_CLASS_SECTION_REPORT]
            });
        }
    };
};
