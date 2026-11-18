import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCollegeLoanInitialData,
    getCollegeLoanSavedRecords
} from '@/server/fees/college/transaction/collegeloanandscholarship';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useCollegeLoanInitialData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_LOAN_SCHOLARSHIP_LOAD],
            queryFn: async () => getCollegeLoanInitialData(),
            staleTime: 1000 * 60 * 10
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_LOAN_SCHOLARSHIP_LOAD]
            })
    };
};

export const useCollegeLoanSavedRecords = (batchId: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_LOAN_SCHOLARSHIP_RECORDS, batchId, searchParams ?? {}],
            queryFn: async () => getCollegeLoanSavedRecords(batchId, searchParams)
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_LOAN_SCHOLARSHIP_RECORDS]
            })
    };
};
