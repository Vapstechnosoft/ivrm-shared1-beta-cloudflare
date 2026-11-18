import { tableSearchVariables } from '@/lib/data-table.config';
import { getMasterSportsCCGroups } from '@/server/sports/masters/sports-cc-group';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

export const useMasterSportsCCGroup = (searchParams?: any) => {
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
        queryKey: ['master-sports-cc-groups', page, pageSize, sortBy, order, searchQuery],
        queryFn: () => getMasterSportsCCGroups(params),
        staleTime: 0
    });

    return {
        loadData,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['master-sports-cc-groups']
            });
        }
    };
};
