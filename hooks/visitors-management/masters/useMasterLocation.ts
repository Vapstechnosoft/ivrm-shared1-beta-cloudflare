'use client';

import { getMasterLocationData, saveMasterLocation } from '@/server/visitors-management/masters/location';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useMasterLocation = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['master-location-data'],
        queryFn: async () => {
            const response = await getMasterLocationData();
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        }
    });

    const saveMutation = useMutation({
        mutationFn: saveMasterLocation,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message);
                queryClient.invalidateQueries({ queryKey: ['master-location-data'] });
            } else {
                toast.error(response.message);
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save location');
        }
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        saveLocation: saveMutation.mutateAsync,
        isSaving: saveMutation.isPending,
        refetch: query.refetch
    };
};
