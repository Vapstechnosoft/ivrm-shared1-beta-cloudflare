'use client';
import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    deleteOralReSchedule,
    deleteReScheduleStudent,
    getOralReScheduleDetails,
    getReScheduleReportDetails,
    getReScheduleSelectedRowDetails,
    saveOralReSchedule
} from '@/server/admission/preadmission/transactions/oral_test_reschedule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useOralReScheduleDetails(classId = 0) {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_RESCHEDULE_DETAILS, classId],
        queryFn: () => getOralReScheduleDetails(classId)
    });
}

export function useReScheduleReportDetails(schids: string) {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.RESCHEDULE_REPORT, schids],
        queryFn: () => getReScheduleReportDetails(schids),
        enabled: !!schids
    });
}

export function useSaveOralReSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveOralReSchedule(data),
        onSuccess: (res: any) => {
            if (res?.returnval === false) {
                toast.error(res?.message || 'Record Already Exist With Same Schedule Name/Date');
            } else {
                toast.success('Interview Re-Scheduled Successfully');
                queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_RESCHEDULE_DETAILS] });
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save reschedule');
        }
    });
}

export function useDeleteReScheduleStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ paotsId, pasrId }: { paotsId: number; pasrId: number }) => deleteReScheduleStudent(paotsId, pasrId),
        onSuccess: () => {
            toast.success('Student removed from schedule');
            queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_RESCHEDULE_DETAILS] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to remove student');
        }
    });
}

export function useDeleteOralReSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteOralReSchedule(id),
        onSuccess: () => {
            toast.success('Schedule deleted successfully');
            queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_RESCHEDULE_DETAILS] });
        }
    });
}

export function useReScheduleSelectedRow(id: number) {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_RESCHEDULE_DETAILS, 'selected', id],
        queryFn: () => getReScheduleSelectedRowDetails(id),
        enabled: !!id
    });
}
