import {
    deactivateStaffGatePass,
    getStaffGatePassData,
    saveStaffGatePass
} from '@/server/visitors-management/transactions/staff-gate-pass';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const STAFF_GATE_PASS_KEY = ['staff-gate-pass'] as const;

export function useStaffGatePass() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: STAFF_GATE_PASS_KEY,
        queryFn: async () => {
            const response = await getStaffGatePassData();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch staff gate pass data');
            }
            return response.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await saveStaffGatePass(data);
            if (!response.success) {
                throw new Error(response.message || 'Failed to save record');
            }
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Saved successfully');
            queryClient.invalidateQueries({ queryKey: STAFF_GATE_PASS_KEY });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save record');
        }
    });

    const statusMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await deactivateStaffGatePass(id);
            if (!response.success) {
                throw new Error(response.message || 'Failed to change status');
            }
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Status changed successfully');
            queryClient.invalidateQueries({ queryKey: STAFF_GATE_PASS_KEY });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to change status');
        }
    });

    return {
        ...query,
        saveStaffGatePass: mutation.mutateAsync,
        isSaving: mutation.isPending,
        changeStatus: statusMutation.mutateAsync,
        isChangingStatus: statusMutation.isPending
    };
}
