import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    type IPDAHeadWiseReportParams,
    getPDAHeadWiseInitialData,
    getPDAHeadWiseReportData
} from '@/server/pettycash/report/PDAHeadWiseReport';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const usePDAHeadWiseInitialData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, 'PDA_HEADWISE_REPORT_INITIAL_DATA'],
            queryFn: () => getPDAHeadWiseInitialData(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const usePDAHeadWiseReportMutation = () => {
    return useMutation({
        mutationFn: (data: IPDAHeadWiseReportParams) => getPDAHeadWiseReportData(data)
    });
};
