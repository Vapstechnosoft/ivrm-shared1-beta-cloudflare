import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getAcademicYear,
    getBifurcationConstraintsDetails,
    getBifurcationViewData,
    getTimeTableCategoryDropDownDetails
} from '@/server/timetable/constraints/bifurcationconstraints';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const usebifurcationconstraints = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, searchParams ?? {}],
            queryFn: async () => getTimeTableCategoryDropDownDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const usebifurcationAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, 'academic_year', searchParams ?? {}],
            queryFn: async () => getAcademicYear(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const usebifurcationGrid = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_Grid, 'Grid', searchParams ?? {}],
            queryFn: async () => getBifurcationConstraintsDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_Grid]
            });
        }
    };
};

export const usebifurcationViewData = ({ id, enabled = false }: { id: number | undefined; enabled?: boolean }) => {
    return useQuery({
        queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_Grid, 'ViewData', id],
        queryFn: async () => {
            if (!id) return null;
            return getBifurcationViewData(id);
        },
        enabled: Boolean(enabled && id && id !== 0),
        staleTime: 0
    });
};
