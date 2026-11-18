import { tableSearchVariables } from '@/lib/data-table.config';
import {
    deactivateEventsStudentSRKVS,
    getClassHouse,
    getEventsStudentSRKVSDetails,
    getEventsStudentSRKVSDropdowns,
    getEventsStudentSRKVSList,
    getSectionList,
    getSportsName,
    getStudents,
    getSubSubEvents,
    saveEventsStudentSRKVS,
    updateStudentSRKVSDetails
} from '@/server/sports/events-student-srkvs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { toast } from 'sonner';

export const useEventsStudentSRKVS = (searchParams?: any) => {
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
        queryKey: ['events-student-srkvs-details', page, pageSize, sortBy, order, searchQuery],
        queryFn: () => getEventsStudentSRKVSList(), // This mock doesn't seem to take params yet
        staleTime: 0
    });

    const dropdowns = useQuery({
        queryKey: ['events-student-srkvs-dropdowns'],
        queryFn: () => getEventsStudentSRKVSDropdowns(),
        staleTime: 1000 * 60 * 5
    });

    const fetchClassHouse = useMutation({
        mutationFn: (asmaY_Id: number) => getClassHouse(asmaY_Id)
    });

    const fetchSectionList = useMutation({
        mutationFn: (data: { ASMAY_Id: number; classListArray: any[] }) => getSectionList(data)
    });

    const fetchSportsName = useMutation({
        mutationFn: (spccmsccG_Id: number) => getSportsName(spccmsccG_Id)
    });

    const fetchSubSubEvents = useMutation({
        mutationFn: (data: { subEventId: number; groupId: number }) => getSubSubEvents(data.subEventId, data.groupId)
    });

    const fetchStudentsMutation = useMutation({
        mutationFn: (payload: any) => getStudents(payload)
    });

    const saveData = useMutation({
        mutationFn: (data: any) => saveEventsStudentSRKVS(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Saved successfully');
            } else {
                toast.error(response.message || 'Failed to save');
            }
            queryClient.invalidateQueries({ queryKey: ['events-student-srkvs-details'] });
        }
    });

    const deactivateData = useMutation({
        mutationFn: (data: { id: number; activeFlag: boolean }) => deactivateEventsStudentSRKVS(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Status updated successfully');
            } else {
                toast.error(response.message || 'Failed to update status');
            }
            queryClient.invalidateQueries({ queryKey: ['events-student-srkvs-details'] });
        }
    });

    const fetchViewDetails = useMutation({
        mutationFn: (id: number) => getEventsStudentSRKVSDetails(id)
    });

    const updateStudentDetails = useMutation({
        mutationFn: (data: any[]) => updateStudentSRKVSDetails(data),
        onSuccess: (response: any) => {
            if (response.success ?? true) {
                toast.success(response.message || 'Details updated successfully');
            } else {
                toast.error(response.message || 'Failed to update details');
            }
            queryClient.invalidateQueries({ queryKey: ['events-student-srkvs-details'] });
        }
    });

    return {
        loadData,
        saveData,
        deactivateData,
        fetchViewDetails,
        updateStudentDetails,
        dropdowns,
        fetchClassHouse,
        fetchSectionList,
        fetchSportsName,
        fetchSubSubEvents,
        fetchStudents: fetchStudentsMutation,
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['events-student-srkvs-details']
            });
        }
    };
};
