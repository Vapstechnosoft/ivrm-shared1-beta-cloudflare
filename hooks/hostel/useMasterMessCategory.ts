'use client';

import { HOSTEL_QUERY_KEYS } from '@/constants/query-keys';
import { getMessCategoryList } from '@/server/hostel/hostel-management/masters/mess-category';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
export const useMasterMessCategory = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HOSTEL_QUERY_KEYS.MASTER_MESS_CATEGORY_GRID, searchParams],
            queryFn: () => getMessCategoryList(searchParams),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HOSTEL_QUERY_KEYS.MASTER_MESS_CATEGORY_GRID]
            });
        }
    };
};

export const useMasterMessCategoryDropdown = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HOSTEL_QUERY_KEYS.MASTER_MESS_CATEGORY_DROPDOWN, searchParams],
            queryFn: () => getMessCategoryList(searchParams),
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HOSTEL_QUERY_KEYS.MASTER_MESS_CATEGORY_GRID]
            });
        }
    };
};
