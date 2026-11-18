import {
    deleteHutchingsBankChallan,
    generateHutchingsBankChallan,
    getHutchingsBankChallanOnload
} from '@/server/fees/reports/hutchings_bank_challan';
import type { IHutchingsBankChallanRequest } from '@/types/fees/reports/hutchings_bank_challan';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const HUTCHINGS_BANK_CHALLAN_QUERY_KEYS = {
    ONLOAD: 'HUTCHINGS_BANK_CHALLAN_ONLOAD',
    LIST: 'HUTCHINGS_BANK_CHALLAN_LIST'
};

export const useHutchingsBankChallanOnload = (ASMAY_Id?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HUTCHINGS_BANK_CHALLAN_QUERY_KEYS.ONLOAD, ASMAY_Id],
            queryFn: async () => getHutchingsBankChallanOnload(ASMAY_Id),
            staleTime: 5 * 60 * 1000
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HUTCHINGS_BANK_CHALLAN_QUERY_KEYS.ONLOAD]
            });
        }
    };
};

export const useGenerateHutchingsBankChallan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: IHutchingsBankChallanRequest) => generateHutchingsBankChallan(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HUTCHINGS_BANK_CHALLAN_QUERY_KEYS.ONLOAD]
            });
        }
    });
};

export const useDeleteHutchingsBankChallan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (challanNo: string) => deleteHutchingsBankChallan(challanNo),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HUTCHINGS_BANK_CHALLAN_QUERY_KEYS.ONLOAD]
            });
        }
    });
};
