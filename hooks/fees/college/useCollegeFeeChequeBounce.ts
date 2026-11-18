import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCollegeFeeChequeBounceAllDetails,
    getCollegeFeeChequeBounceReceipts
} from '@/server/fees/college/transaction/clgfeechequebounce';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Re-export shared dropdown hooks from useTransactions (uses APIs from clgfeewaivedoff.ts)
export {
    useCollegeAcademicYears,
    useCollegeBranches,
    useCollegeCourses,
    useCollegeSemesters,
    useCollegeStudents
} from './useTransactions';

// 1. Main Grid List Hook
export const useCollegeFeeChequeBounceList = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_CHEQUE_BOUNCE_LIST, searchParams ?? {}],
            queryFn: async () => getCollegeFeeChequeBounceAllDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_CHEQUE_BOUNCE_LIST]
            });
        }
    };
};

// 2. Receipts Hook (Cheque Bounce specific)
export const useCollegeFeeChequeBounceReceipts = (asmaY_Id?: number, amcsT_Id?: number) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_CHEQUE_BOUNCE_RECEIPTS, asmaY_Id, amcsT_Id],
        queryFn: async () => {
            if (!asmaY_Id || !amcsT_Id) return null;
            return getCollegeFeeChequeBounceReceipts({ asmaY_Id, amcsT_Id });
        },
        enabled: !!asmaY_Id && !!amcsT_Id
    });
};
