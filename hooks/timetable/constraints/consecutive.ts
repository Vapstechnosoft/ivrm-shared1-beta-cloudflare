import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getAcademicYearDropDownMasterDayClasswise,
    getCategoryDropDownMasterDayClasswise,
    getConsecutiveConstraintsDetails,
    getSectionDetails,
    getStaffDropDownMasterDayClasswise
} from '@/server/timetable/constraints/consecutive';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useConsecutive = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CONSECUTIVE_CONSTRAINTS, searchParams ?? {}],
            queryFn: async () => getConsecutiveConstraintsDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CONSECUTIVE_CONSTRAINTS]
            });
        }
    };
};

//academic Year
export const useAcademicYearDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.ACADEMIC_YEAR_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getAcademicYearDropDownMasterDayClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.ACADEMIC_YEAR_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

//category
export const useCategoryDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getCategoryDropDownMasterDayClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

//section
export const useSectionDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SECTION_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getSectionDetails(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SECTION_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

// //class
// export const useClassDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
//     const queryClient = useQueryClient();

//     return {
//         ...useQuery({
//             queryKey: [TIMETABLE_QUERY_KEYS.CLASS_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
//             queryFn: async () => getTransactionClassDropdown(),
//             staleTime: 0
//         }),

//         refetchAll: () => {
//             return queryClient.invalidateQueries({
//                 queryKey: [TIMETABLE_QUERY_KEYS.CLASS_DROPDOWN_MASTERDAYCLASSWISE]
//             });
//         }
//     };
// };

// export const useClassByCategory = (ASMAY_Id: number, TTMC_Id: number) => {
//     return useQuery({
//         queryKey: ['CLASS_BY_CATEGORY', ASMAY_Id, TTMC_Id],
//         queryFn: async () => getClassByCategory({ ASMAY_Id, TTMC_Id }),
//         enabled: !!(ASMAY_Id && TTMC_Id),
//         staleTime: 0
//     });
// };

// export const useSectionByClass = (ASMAY_Id: number, ASMCL_Id: number, TTMC_Id: number) => {
//     return useQuery({
//         queryKey: ['SECTION_BY_CLASS', ASMAY_Id, ASMCL_Id, TTMC_Id],
//         queryFn: async () => getSectionByClass({ ASMAY_Id, ASMCL_Id, TTMC_Id }),
//         enabled: !!(ASMAY_Id && ASMCL_Id && TTMC_Id),
//         staleTime: 0
//     });
// };

export const useStaffDropDownMasterDayClasswise = (data: { ASMAY_Id: number; TTMC_Id: number; ASMCL_Id: number; ASMS_Id: number }) => {
    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.STAFF_DROPDOWN_MASTERDAYCLASSWISE, data],
            queryFn: async () => getStaffDropDownMasterDayClasswise(data),
            enabled: !!(data.ASMAY_Id && data.TTMC_Id && data.ASMCL_Id && data.ASMS_Id),
            staleTime: 0
        })
    };
};
