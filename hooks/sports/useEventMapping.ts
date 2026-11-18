import { tableSearchVariables } from '@/lib/data-table.config';
import {
    deactivateEventMapping,
    editEventMapping,
    getEventMappingDetails,
    getModelData,
    saveEventMapping
} from '@/server/sports/transactions/events-mapping';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { toast } from 'sonner';

export const useEventMapping = (searchParams?: any) => {
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
        queryKey: ['events-mapping-details', page, pageSize, sortBy, order, searchQuery],
        queryFn: () => getEventMappingDetails(params),
        staleTime: 0
    });

    const save = useMutation({
        mutationFn: (data: any) => saveEventMapping(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events-mapping-details'] });
        }
    });

    const edit = useMutation({
        mutationFn: (data: any) => editEventMapping(data)
    });

    const deactivate = useMutation({
        mutationFn: (data: any) => deactivateEventMapping(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Status updated successfully');
            } else {
                toast.error(response.message || 'Failed to update status');
            }
            queryClient.invalidateQueries({ queryKey: ['events-mapping-details'] });
        }
    });

    const modelData = useMutation({
        mutationFn: (data: any) => getModelData(data)
    });

    return {
        loadData,
        save,
        edit,
        deactivate,
        modelData,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['events-mapping-details']
            });
        }
    };
};
