import { tableSearchVariables } from '@/lib/data-table.config';
import {
    deactivateEventsSponsorMapping,
    getEditEventsSponsorMapping,
    getEventsSponsorMapping,
    saveEventsSponsorMapping
} from '@/server/sports/transactions/events-sponsor';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { toast } from 'sonner';

export const useEventsSponsor = (searchParams?: any) => {
    const queryClient = useQueryClient();

    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [sortBy] = useQueryState(tableSearchVariables.sort_column, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [order] = useQueryState(
        tableSearchVariables.sort_direction,
        parseAsStringLiteral(['asc', 'desc'] as const)
            .withOptions({ shallow: false })
            .withDefault('asc')
    );
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const params = {
        page: page,
        page_size: pageSize,
        sort_column: sortBy,
        sort_direction: order,
        search_query: searchQuery
    };

    const loadData = useQuery({
        queryKey: ['events-sponsor-details', page, pageSize, sortBy, order, searchQuery],
        queryFn: () => getEventsSponsorMapping(params),
        staleTime: 0
    });

    const save = useMutation({
        mutationFn: (data: any) => saveEventsSponsorMapping(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Saved successfully');
            } else {
                toast.error(response.message || 'Failed to save');
            }
            queryClient.invalidateQueries({ queryKey: ['events-sponsor-details'] });
        }
    });

    const deactivateMutation = useMutation({
        mutationFn: (data: { spccesP_Id: number; spccesP_ActiveFlag: boolean }) => deactivateEventsSponsorMapping(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Status updated successfully');
            } else {
                toast.error(response.message || 'Failed to update status');
            }
            queryClient.invalidateQueries({ queryKey: ['events-sponsor-details'] });
        }
    });

    return {
        loadData,
        details: loadData,
        save,
        saveMutation: save,
        deactivateMutation,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['events-sponsor-details']
            });
        }
    };
};

export const useEventsSponsorEdit = (id?: number) => {
    return useQuery({
        queryKey: ['events-sponsor-edit', id],
        queryFn: () => getEditEventsSponsorMapping(id!),
        enabled: Boolean(id && id > 0)
    });
};
