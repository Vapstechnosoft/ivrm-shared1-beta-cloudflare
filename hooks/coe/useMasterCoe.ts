import { COE_QUERY_KEYS } from '@/constants/query-keys';
import { getCOEMappingDetails, getMasterCOEData } from '@/server/coe/masters/master-coe';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterCoe = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COE_QUERY_KEYS.MASTER_COE],
            queryFn: async () => getMasterCOEData(),
            staleTime: 5 * 60 * 1000
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COE_QUERY_KEYS.MASTER_COE]
            });
        }
    };
};

export const useCOEMappingDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COE_QUERY_KEYS.COE_MAPPING_DETAILS, searchParams ?? {}],
            queryFn: async () => getCOEMappingDetails(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COE_QUERY_KEYS.COE_MAPPING_DETAILS]
            });
        }
    };
};
