import {
    endMainMeeting,
    getEmpDetails,
    getStudentDocsOnly,
    joinMeeting,
    onDateChange,
    onScheduleChange,
    onStartMeeting,
    saveRemarks
} from '@/server/admission/preadmission/transactions/pre_meeting_schedule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const QUERY_KEYS = {
    PRE_MEETING_DETAILS: 'pre-meeting-details'
};

export function usePreMeetingDetails() {
    return useQuery({
        queryKey: [QUERY_KEYS.PRE_MEETING_DETAILS],
        queryFn: () => getEmpDetails()
    });
}

export function useEndMainMeeting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => endMainMeeting(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRE_MEETING_DETAILS] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to end meeting');
        }
    });
}

export function useSaveMeetingRemarks() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveRemarks(data),
        onSuccess: (res: any) => {
            if (res?.returnval) {
                toast.success('Remarks updated successfully');
            } else {
                toast.error('Remarks Not Saved');
            }
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRE_MEETING_DETAILS] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save remarks');
        }
    });
}

export function useOnStartMeeting() {
    return useMutation({
        mutationFn: (data: any) => onStartMeeting(data),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to start meeting');
        }
    });
}

export function useJoinMeeting() {
    return useMutation({
        mutationFn: (data: any) => joinMeeting(data),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to join meeting');
        }
    });
}

export function useOnDateChange() {
    return useMutation({
        mutationFn: (data: any) => onDateChange(data),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to load details for date');
        }
    });
}

export function useOnScheduleChange() {
    return useMutation({
        mutationFn: (data: any) => onScheduleChange(data),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to load details for schedule');
        }
    });
}

export function useGetStudentDocsOnly() {
    return useMutation({
        mutationFn: (data: any) => getStudentDocsOnly(data),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to load student documents');
        }
    });
}
