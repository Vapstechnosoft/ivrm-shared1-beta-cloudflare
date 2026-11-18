'use client';

import { INVENTORY_QUERY_KEYS } from '@/constants/query-keys';
import { fetchMainGroupDropdownData } from '@/server/inventory/masters/inv-master-group';
import { getInvMasterItem, getUOMDropdown } from '@/server/inventory/masters/inv-master-item';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useInvMasterItem = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [INVENTORY_QUERY_KEYS.INV_MASTER_ITEM, searchParams ?? {}],
        queryFn: async () => {
            const [itemData, uomData, mainGroupData] = await Promise.all([
                getInvMasterItem(searchParams ?? {}),
                getUOMDropdown(),
                fetchMainGroupDropdownData()
            ]);

            return {
                ...(itemData || {}),
                get_UOM: uomData?.data?.$values || (Array.isArray(uomData?.data) ? uomData?.data : []) || [],
                get_maingroup: mainGroupData?.data?.$values || (Array.isArray(mainGroupData?.data) ? mainGroupData?.data : []) || []
            };
        },
        staleTime: 0
    });

    return {
        ...query,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [INVENTORY_QUERY_KEYS.INV_MASTER_ITEM]
            });
        }
    };
};
