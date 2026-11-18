import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getAcademicYearSubject,
    getCategorySubject,
    getStaffDropDownDayStaff,
    getSubjectDaySubject,
    getSubjectRestrictionDayPeriodGridData,
    getSubjectRestrictionDayStaffGridData,
    getSubjectRestrictionDaySubjectGridData,
    getSubjectRestrictionPeriodStaffGridData,
    getSubjectRestrictionPeriodSubjectGridData
} from '@/server/timetable/constraints/subjectrestriction';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface SubjectRestrictionParams {
    ASMAY_Id: number;
    TTMC_Id: number;
    [key: string]: any; // Allow for generic search/pagination params
}

export const useSubjectRestrictionDayPeriodGridData = (params?: ApiSearchparams | any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_PERIOD_GRID, params ?? {}],
            queryFn: async () => {
                return await getSubjectRestrictionDayPeriodGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_PERIOD_GRID]
            });
        }
    };
};

export const useSubjectRestrictionDaySubjectGridData = (params?: ApiSearchparams | any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_SUBJECT_GRID, params ?? {}],
            queryFn: async () => {
                return await getSubjectRestrictionDaySubjectGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_SUBJECT_GRID]
            });
        }
    };
};

export const useSubjectRestrictionDayStaffGridData = (params?: ApiSearchparams | any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_STAFF_GRID, params ?? {}],
            queryFn: async () => {
                return await getSubjectRestrictionDayStaffGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_DAY_STAFF_GRID]
            });
        }
    };
};

export const useSubjectRestrictionPeriodStaffGridData = (params?: ApiSearchparams | any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_PERIOD_STAFF_GRID, params ?? {}],
            queryFn: async () => {
                return await getSubjectRestrictionPeriodStaffGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_PERIOD_STAFF_GRID]
            });
        }
    };
};

export const useSubjectRestrictionPeriodSubjectGridData = (params?: ApiSearchparams | any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_PERIOD_SUBJECT_GRID, params ?? {}],
            queryFn: async () => {
                return await getSubjectRestrictionPeriodSubjectGridData(params);
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.SUBJECT_RESTRICTION_PERIOD_SUBJECT_GRID]
            });
        }
    };
};

//academic year
export const useAcademicYearDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.ACADEMIC_YEAR_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getAcademicYearSubject(),
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
export const useCategtoryDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE, searchParams ?? {}],
            queryFn: async () => getCategorySubject(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.CATEGORY_DROPDOWN_MASTERDAYCLASSWISE]
            });
        }
    };
};

//staff
export const useStaffDropDownDayStaff = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getStaffDropDownDayStaff(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_STAFF_DROPDOWN]
            });
        }
    };
};

//subject

export const useSubjectDropDownMasterDayClasswise = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_DROPDOWN, searchParams ?? {}],
            queryFn: async () => getSubjectDaySubject(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.MASTER_SUBJECT_DROPDOWN]
            });
        }
    };
};
