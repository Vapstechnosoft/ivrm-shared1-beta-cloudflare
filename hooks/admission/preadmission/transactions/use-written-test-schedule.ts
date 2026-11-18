import {
    deleteWrittenTestSchedule,
    deleteWrittenTestScheduleStudentData,
    getWrittenTestScheduleDetails,
    getWrittenTestSelectedRowDetails,
    getWrittenTestStudentDetails,
    saveWrittenTestSchedule
} from '@/server/admission/preadmission/transactions/written_test_schedule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = 'writtenTestSchedule';

export const useWrittenTestScheduleDetails = (classId = 0) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [QUERY_KEY, 'details', classId],
            queryFn: async (): Promise<any> => getWrittenTestScheduleDetails(classId),
            staleTime: 0
        }),
        refetchAll: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    };
};

export const useWrittenTestScheduleClassChange = () => {
    return useMutation({
        mutationFn: async (classId: number): Promise<any> => getWrittenTestScheduleDetails(classId)
    });
};

export const useSaveWrittenTestSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveWrittenTestSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
    });
};

export const useDeleteWrittenTestSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWrittenTestSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
    });
};

export const useWrittenTestSelectedRowDetails = (id?: number) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'selectedRowDetails', id],
        queryFn: async (): Promise<any> => {
            if (!id) return null;
            return await getWrittenTestSelectedRowDetails(id);
        },
        enabled: !!id,
        staleTime: 0
    });
};

export const useDeleteWrittenTestScheduleStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWrittenTestScheduleStudentData,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
    });
};

export const useWrittenTestStudentDetails = (pawtS_Id?: number) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'studentDetails', pawtS_Id],
        queryFn: async (): Promise<any> => {
            if (!pawtS_Id) return null;
            return await getWrittenTestStudentDetails(pawtS_Id);
        },
        enabled: !!pawtS_Id,
        staleTime: 0
    });
};
