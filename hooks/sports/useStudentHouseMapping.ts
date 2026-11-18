import { tableSearchVariables } from '@/lib/data-table.config';
import {
    deleteStudentHouseMapping,
    editStudentHouseMapping,
    getClassListForHouseMapping,
    getSectionListForHouseMapping,
    getStudentHouseMappingLoadData,
    getStudentListForHouseMapping,
    saveStudentHouseMapping
} from '@/server/sports/masters/student-house-mapping';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

export const useStudentHouseMapping = () => {
    const queryClient = useQueryClient();

    // Use nuqs hooks for reactive URL state with centralized variables
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

    /** Initial load: academic years, houses, and grid data */
    const loadData = useQuery({
        queryKey: ['student-house-mapping-load', page, pageSize, sortBy, order, searchQuery],
        queryFn: () => getStudentHouseMappingLoadData(params),
        staleTime: 0
    });

    /** Cascading: fetch classes when year changes */
    const getClasses = useMutation({
        mutationFn: (asmaY_Id: number) => getClassListForHouseMapping(asmaY_Id)
    });

    /** Cascading: fetch sections when class changes */
    const getSections = useMutation({
        mutationFn: ({ asmaY_Id, asmcL_Id }: { asmaY_Id: number; asmcL_Id: number }) => getSectionListForHouseMapping(asmaY_Id, asmcL_Id)
    });

    /** Cascading: fetch students when section changes */
    const getStudents = useMutation({
        mutationFn: ({ asmaY_Id, asmcL_Id, asmS_Id }: { asmaY_Id: number; asmcL_Id: number; asmS_Id: number }) =>
            getStudentListForHouseMapping(asmaY_Id, asmcL_Id, asmS_Id)
    });

    /** Fetch edit record data */
    const editData = useMutation({
        mutationFn: ({ spccsH_Id, asmaY_Id }: { spccsH_Id: number; asmaY_Id: number }) => editStudentHouseMapping(spccsH_Id, asmaY_Id)
    });

    /** Save */
    const saveData = useMutation({
        mutationFn: (data: any) => saveStudentHouseMapping(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-house-mapping-load'] });
        }
    });

    /** Activate / Deactivate */
    const toggleData = useMutation({
        mutationFn: (spccsH_Id: number) => deleteStudentHouseMapping(spccsH_Id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-house-mapping-load'] });
        }
    });

    return {
        loadData,
        getClasses,
        getSections,
        getStudents,
        editData,
        saveData,
        toggleData,
        refetchAll: () => queryClient.invalidateQueries({ queryKey: ['student-house-mapping-load'] })
    };
};
