'use client';

import { getVisitorAppointmentData, saveVisitorAppointment } from '@/server/visitors-management/transactions/visitor-appointment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useVisitorAppointment = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['visitor-appointment-data'],
        queryFn: async () => {
            const response = await getVisitorAppointmentData();
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        }
    });

    const saveMutation = useMutation({
        mutationFn: saveVisitorAppointment,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({ queryKey: ['visitor-appointment-data'] });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save appointment');
        }
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        saveAppointment: saveMutation.mutateAsync,
        isSaving: saveMutation.isPending,
        refetch: query.refetch
    };
};
