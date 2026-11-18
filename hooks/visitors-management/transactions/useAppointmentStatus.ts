import {
    getAppointmentStatusData,
    getAppointmentStatusEdit,
    saveAppointmentStatus
} from '@/server/visitors-management/transactions/appointment-status';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const APPOINTMENT_STATUS_KEY = ['appointment-status'] as const;

export function useAppointmentStatus() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: APPOINTMENT_STATUS_KEY,
        queryFn: async () => {
            const response = await getAppointmentStatusData();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch appointment status data');
            }
            return response.data;
        }
    });

    const editMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await getAppointmentStatusEdit(id);
            if (!response.success) throw new Error(response.message);
            return response.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await saveAppointmentStatus(data);
            if (!response.success) {
                throw new Error(response.message || 'Failed to save appointment status');
            }
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Appointment status saved successfully');
            queryClient.invalidateQueries({ queryKey: APPOINTMENT_STATUS_KEY });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save appointment status');
        }
    });

    return {
        ...query,
        saveAppointmentStatus: mutation.mutateAsync,
        isSaving: mutation.isPending,
        getEditData: editMutation.mutateAsync,
        isFetchingEdit: editMutation.isPending
    };
}
