import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import { getCollegeFeePrivilegeAcademicYears } from '@/server/fees/college/masters/masterclgfeeprevilege';
import {
    getCollegeFeeTransactionDetails,
    getCollegeMasterBank
} from '@/server/fees/college/transaction/college_fee_transaction';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useCollegeFeeTransactionList = (asmaY_Id: number, searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_TRANSACTION, asmaY_Id, searchParams ?? {}],
            queryFn: async () => getCollegeFeeTransactionDetails(asmaY_Id, searchParams)
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_TRANSACTION]
            })
    };
};

export const useCollegeFeeTransactionAcademicYears = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_TRANSACTION_ACADEMIC_YEARS],
            queryFn: async () => getCollegeFeePrivilegeAcademicYears(),
            staleTime: 1000 * 60 * 10
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_TRANSACTION_ACADEMIC_YEARS]
            })
    };
};

export const useCollegeMasterBanks = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: ['college_fee_master_bank'],
            queryFn: async () => getCollegeMasterBank(),
            staleTime: 1000 * 60 * 10
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: ['college_fee_master_bank']
            })
    };
};
