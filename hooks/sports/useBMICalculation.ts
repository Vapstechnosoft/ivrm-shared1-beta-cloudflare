import { tableSearchVariables } from '@/lib/data-table.config';
import { deactivateBMIRecord, editBMIRecord, getBMILoadGrid, saveBMIRecord } from '@/server/sports/transactions/bmi-calculation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { toast } from 'sonner';

export const useBMICalculation = (searchParams?: any) => {
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
        queryKey: ['bmi-calculation', page, pageSize, sortBy, order, searchQuery],
        queryFn: () => getBMILoadGrid(params),
        staleTime: 0
    });

    const save = useMutation({
        mutationFn: (data: any) => saveBMIRecord(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Saved successfully');
            } else {
                toast.error(response.message || 'Failed to save');
            }
            queryClient.invalidateQueries({ queryKey: ['bmi-calculation'] });
        }
    });

    const edit = useMutation({
        mutationFn: (data: any) => editBMIRecord(data)
    });

    const deactivate = useMutation({
        mutationFn: (id: number) => deactivateBMIRecord(id),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Status updated successfully');
            } else {
                toast.error(response.message || 'Failed to update status');
            }
            queryClient.invalidateQueries({ queryKey: ['bmi-calculation'] });
        }
    });

    return {
        loadData,
        save,
        edit,
        deactivate,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['bmi-calculation']
            });
        }
    };
};
