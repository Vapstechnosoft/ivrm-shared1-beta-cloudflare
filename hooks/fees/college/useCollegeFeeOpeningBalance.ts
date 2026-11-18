import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCollegeFeeOpeningBalanceAllDetails,
    getCollegeOpeningBalanceGroups,
    getCollegeOpeningBalanceHeads,
    getCollegeOpeningBalanceInstallments
} from '@/server/fees/college/transaction/clgfeeopeningbalance';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Re-export shared dropdown hooks from useTransactions
export {
    useCollegeAcademicYears,
    useCollegeBranches,
    useCollegeCourses,
    useCollegeSemesters
} from './useTransactions';

// 1. Main Grid List Hook
export const useCollegeFeeOpeningBalanceList = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_OPENING_BALANCE_LIST, searchParams ?? {}],
            queryFn: async () => getCollegeFeeOpeningBalanceAllDetails(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_OPENING_BALANCE_LIST]
            });
        }
    };
};

// 2. Groups Hook
export const useCollegeOpeningBalanceGroups = (asmaY_Id?: number, amcO_Id?: number, amB_Id?: number, amsE_Id?: number) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_OPENING_BALANCE_GROUPS, asmaY_Id, amcO_Id, amB_Id, amsE_Id],
        queryFn: async () => {
            if (!asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id) return null;
            return getCollegeOpeningBalanceGroups({ asmaY_Id, amcO_Id, amB_Id, amsE_Id });
        },
        enabled: !!asmaY_Id && !!amcO_Id && !!amB_Id && !!amsE_Id
    });
};

// 3. Heads Hook
export const useCollegeOpeningBalanceHeads = (asmaY_Id?: number, amcO_Id?: number, amB_Id?: number, amsE_Id?: number, fmG_Id?: number) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_OPENING_BALANCE_HEADS, asmaY_Id, amcO_Id, amB_Id, amsE_Id, fmG_Id],
        queryFn: async () => {
            if (!asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id || !fmG_Id) return null;
            return getCollegeOpeningBalanceHeads({ asmaY_Id, amcO_Id, amB_Id, amsE_Id, fmG_Id });
        },
        enabled: !!asmaY_Id && !!amcO_Id && !!amB_Id && !!amsE_Id && !!fmG_Id
    });
};

// 4. Installments Hook
export const useCollegeOpeningBalanceInstallments = (
    asmaY_Id?: number,
    amcO_Id?: number,
    amB_Id?: number,
    amsE_Id?: number,
    fmG_Id?: number,
    fmH_Id?: number
) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_OPENING_BALANCE_INSTALLMENTS, asmaY_Id, amcO_Id, amB_Id, amsE_Id, fmG_Id, fmH_Id],
        queryFn: async () => {
            if (!asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id || !fmG_Id || !fmH_Id) return null;
            return getCollegeOpeningBalanceInstallments({ asmaY_Id, amcO_Id, amB_Id, amsE_Id, fmG_Id, fmH_Id });
        },
        enabled: !!asmaY_Id && !!amcO_Id && !!amB_Id && !!amsE_Id && !!fmG_Id && !!fmH_Id
    });
};
