import { PETTYCASH_QUERY_KEYS } from '@/constants/pettycashandassettracking-query-keys';
import { getMasterParticularsGrid } from '@/server/pettycash/master/particulars';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterParticulars = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.MASTER_PARTICULARS, searchParams ?? {}],
            queryFn: async () => getMasterParticularsGrid(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.MASTER_PARTICULARS]
            })
    };
};
