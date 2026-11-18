import {
    deactivateStudentGatePass,
    getGatePassClasses,
    getGatePassSections,
    getGatePassStudents,
    getStudentGatePassData,
    saveStudentGatePass
} from '@/server/visitors-management/transactions/student-gate-pass';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const STUDENT_GATE_PASS_KEY = ['student-gate-pass'] as const;

export function useStudentGatePass() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: STUDENT_GATE_PASS_KEY,
        queryFn: async () => {
            const response = await getStudentGatePassData();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch student gate pass data');
            }
            return response.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await saveStudentGatePass(data);
            if (!response.success) {
                throw new Error(response.message || 'Failed to save record');
            }
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Saved successfully');
            queryClient.invalidateQueries({ queryKey: STUDENT_GATE_PASS_KEY });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save record');
        }
    });

    const statusMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await deactivateStudentGatePass(id);
            if (!response.success) {
                throw new Error(response.message || 'Failed to change status');
            }
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Status changed successfully');
            queryClient.invalidateQueries({ queryKey: STUDENT_GATE_PASS_KEY });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to change status');
        }
    });

    return {
        ...query,
        saveStudentGatePass: mutation.mutateAsync,
        isSaving: mutation.isPending,
        changeStatus: statusMutation.mutateAsync,
        isChangingStatus: statusMutation.isPending,
        getGatePassClasses,
        getGatePassSections,
        getGatePassStudents
    };
}
