import { tableSearchVariables } from '@/lib/data-table.config';
import {
    deactivateEventsStudentMapping,
    getEventsStudentMappingList,
    saveEventsStudentMapping
} from '@/server/sports/events-student-mapping';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { toast } from 'sonner';

export const useEventsStudentMapping = (searchParams?: any) => {
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
        queryKey: ['events-student-mapping-details', page, pageSize, sortBy, order, searchQuery],
        queryFn: () => getEventsStudentMappingList(), // This mock doesn't seem to take params yet, but we'll follow the pattern
        staleTime: 0
    });

    const save = useMutation({
        mutationFn: (data: any) => saveEventsStudentMapping(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Saved successfully');
            } else {
                toast.error(response.message || 'Failed to save');
            }
            queryClient.invalidateQueries({ queryKey: ['events-student-mapping-details'] });
        }
    });

    const deactivate = useMutation({
        mutationFn: (data: { id: number; activeFlag: boolean }) => deactivateEventsStudentMapping(data.id, data.activeFlag),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Status updated successfully');
            } else {
                toast.error(response.message || 'Failed to update status');
            }
            queryClient.invalidateQueries({ queryKey: ['events-student-mapping-details'] });
        }
    });

    return {
        loadData,
        save,
        deactivate,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['events-student-mapping-details']
            });
        }
    };
};
