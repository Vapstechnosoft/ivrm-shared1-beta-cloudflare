import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import { getAcademicYearList, getPDAReport, getPDAReportInitialData } from '@/server/pettycash/report/PCReport';
import type { IPDAReportParams } from '@/types/pettycash/report/PDAReport';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

//incomereport

export const usePDAReportInitialData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, 'PDA_REPORT_INITIAL_DATA'],
            queryFn: () => getPDAReportInitialData(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const usePDAReportMutation = () => {
    return useMutation({
        mutationFn: (data: IPDAReportParams) => getPDAReport(data)
    });
};

export const usePDAReportQuery = (params: IPDAReportParams | null) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, params ?? {}],
            queryFn: async () => {
                if (!params) return null;
                return await getPDAReport(params);
            },
            enabled: !!params,
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const useAcademicYearList = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, 'ACADEMIC_YEAR_LIST'],
            queryFn: async () => getAcademicYearList(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};
