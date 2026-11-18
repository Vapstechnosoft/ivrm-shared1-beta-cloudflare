import { PETTYCASH_QUERY_KEYS } from '@/constants/pettycashandassettracking-query-keys';
import { getIndentGrid, getOrganizationDropdown } from '@/server/pettycash/transaction/pcIndent';
import type { IIndentFilters } from '@/types/pettycash/transaction/pcIndent';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch the Petty Cash Indent grid based on filters.
 */
export const usePcIndent = (filters: IIndentFilters, enabled = false) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.PC_INDENT, filters],
            queryFn: async () => getIndentGrid(filters),
            enabled: enabled,
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.PC_INDENT]
            })
    };
};

/**
 * Hook to fetch organization dropdown data.
 */
export const useOrganizationDropdown = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.ORGANIZATION_DROPDOWN],
            queryFn: async () => getOrganizationDropdown(),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.ORGANIZATION_DROPDOWN]
            })
    };
};
