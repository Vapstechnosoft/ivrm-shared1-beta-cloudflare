import { PETTYCASH_QUERY_KEYS } from '@/constants/pettycashandassettracking-query-keys';
import { getBankCopyReport, getBankCopyReportDetails, getBankCopyReportInitialData } from '@/server/pettycash/report/BankCopyReport';
import type { IBankCopyReportParams } from '@/types/pettycash/report/BankCopyReport';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useBankCopyReportInitialData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.PC_BANK_COPY, 'BANK_COPY_REPORT_INITIAL_DATA'],
            queryFn: () => getBankCopyReportInitialData(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.PC_BANK_COPY]
            });
        }
    };
};

export const useBankCopyReportMutation = () => {
    return useMutation({
        mutationFn: (data: IBankCopyReportParams) => getBankCopyReport(data)
    });
};

export const useBankCopyReportDetailsMutation = () => {
    return useMutation({
        mutationFn: (data: any) => getBankCopyReportDetails(data)
    });
};
