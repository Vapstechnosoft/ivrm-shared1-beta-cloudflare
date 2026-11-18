import {
    deactivateStudentLateIn,
    getClasses,
    getSections,
    getStudentLateInData,
    getStudents,
    saveStudentLateIn
} from '@/server/visitors-management/transactions/student-late-in';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const STUDENT_LATE_IN_KEY = ['student-late-in'] as const;

export function useStudentLateIn() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: STUDENT_LATE_IN_KEY,
        queryFn: async () => {
            const response = await getStudentLateInData();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch student late in data');
            }
            return response.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await saveStudentLateIn(data);
            if (!response.success) {
                throw new Error(response.message || 'Failed to save record');
            }
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Saved successfully');
            queryClient.invalidateQueries({ queryKey: STUDENT_LATE_IN_KEY });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save record');
        }
    });

    const statusMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await deactivateStudentLateIn(id);
            if (!response.success) {
                throw new Error(response.message || 'Failed to change status');
            }
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Status changed successfully');
            queryClient.invalidateQueries({ queryKey: STUDENT_LATE_IN_KEY });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to change status');
        }
    });

    return {
        ...query,
        saveStudentLateIn: mutation.mutateAsync,
        isSaving: mutation.isPending,
        changeStatus: statusMutation.mutateAsync,
        isChangingStatus: statusMutation.isPending,
        getClasses,
        getSections,
        getStudents
    };
}
