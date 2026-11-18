import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    LabConstraintsGrid,
    getAcademicYearDropDownClasswise,
    getCategoryDropDown,
    getClassDropdown,
    getLabDropDown,
    getSectionDropDown,
    getSubjectDropDown
} from '@/server/timetable/constraints/labconstraints';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useAcademicYearDropDown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS ?? {}],
            queryFn: async () => getAcademicYearDropDownClasswise(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useCategoryDropDownDropDown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS ?? {}],
            queryFn: async () => getCategoryDropDown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useClassDropDown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS ?? {}],
            queryFn: async () => getClassDropdown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useSectionDropDown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS ?? {}],
            queryFn: async () => getSectionDropDown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useSubjectDropDown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS ?? {}],
            queryFn: async () => getSubjectDropDown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useLabDropDown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS ?? {}],
            queryFn: async () => getLabDropDown(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useLabConstraintsGrid = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_STAFF_GRID, 'grid', searchParams],
            queryFn: async () => LabConstraintsGrid(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_STAFF_GRID]
            });
        }
    };
};
