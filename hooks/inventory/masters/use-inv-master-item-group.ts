'use client';

import { INVENTORY_QUERY_KEYS } from '@/constants/query-keys';
import { fetchItemGroupData } from '@/server/inventory/masters/item-group';
import type { ApiSearchparams } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useInvMasterItemGroup = (searchParams?: ApiSearchparams) => {
    const query = useQuery({
        queryKey: [INVENTORY_QUERY_KEYS.INV_MASTER_GROUP, 'item-group', searchParams],
        queryFn: () => fetchItemGroupData(searchParams),
        staleTime: 0
    });

    return {
        ...query,
        refetchAll: query.refetch
    };
};
