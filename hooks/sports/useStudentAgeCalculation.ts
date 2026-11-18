import { tableSearchVariables } from '@/lib/data-table.config';
import { getInitialData, getStudents, saveStudentAge } from '@/server/sports/transactions/student-age-calculation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { toast } from 'sonner';

export const useStudentAgeCalculation = (searchParams?: any) => {
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
        queryKey: ['student-age-calculation', page, pageSize, sortBy, order, searchQuery],
        queryFn: () => getInitialData(params),
        staleTime: 0
    });

    const studentsData = useMutation({
        mutationFn: (data: any) => getStudents(data)
    });

    const saveData = useMutation({
        mutationFn: (data: any) => saveStudentAge(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Saved successfully');
            } else {
                toast.error(response.message || 'Failed to save');
            }
            queryClient.invalidateQueries({ queryKey: ['student-age-calculation'] });
        }
    });

    return {
        loadData,
        studentsData,
        saveData,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['student-age-calculation']
            });
        }
    };
};
