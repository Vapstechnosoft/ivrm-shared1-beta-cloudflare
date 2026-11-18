import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getFixingDayPeriodGridData,
    getFixingDayStaffGridData,
    getFixingDaySubjectGridData,
    getFixingPeriodStaffGridData,
    getFixingPeriodSubjectGridData
} from '@/server/timetable/constraints/fixing';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useDayStaffGridData = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_STAFF_GRID, 'grid', searchParams],
            queryFn: async () => getFixingDayStaffGridData(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_STAFF_GRID]
            });
        }
    };
};

export const useFixingDayPeriodGridData = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_PERIOD_GRID, 'grid', searchParams],
            queryFn: async () => getFixingDayPeriodGridData(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_PERIOD_GRID]
            });
        }
    };
};

export const useDaySubjectGridData = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_SUBJECT_GRID, 'grid', searchParams],
            queryFn: async () => getFixingDaySubjectGridData(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_DAY_SUBJECT_GRID]
            });
        }
    };
};

export const usePeriodSubjectGridData = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_PERIOD_SUBJECT_GRID, 'grid', searchParams],
            queryFn: async () => getFixingPeriodSubjectGridData(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_PERIOD_SUBJECT_GRID]
            });
        }
    };
};

export const usePeriodStaffGridData = (searchParams?: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.FIXING_PERIOD_STAFF_GRID, 'grid', searchParams],
            queryFn: async () => getFixingPeriodStaffGridData(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.FIXING_PERIOD_STAFF_GRID]
            });
        }
    };
};
