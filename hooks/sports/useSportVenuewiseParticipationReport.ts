import { tableSearchVariables } from '@/lib/data-table.config';
import { getDetails, getInitialData, getReportData, getSections } from '@/server/sports/transactions/sport-venuewise-participation-report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

export const useSportVenuewiseParticipationReport = (searchParams?: any) => {
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

    const loadData = useQuery({
        queryKey: ['venuewise-participation-report-initial'],
        queryFn: () => getInitialData(),
        staleTime: 0
    });

    const detailsData = useMutation({
        mutationFn: (payload: { asmaY_Id: number }) => getDetails(payload)
    });

    const sectionsData = useMutation({
        mutationFn: (payload: { asmaY_Id: number; asmcL_Id: number }) => getSections(payload)
    });

    const reportData = useMutation({
        mutationFn: (payload: any) => getReportData(payload)
    });

    return {
        loadData,
        detailsData,
        sectionsData,
        reportData,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['venuewise-participation-report-initial']
            });
        }
    };
};
