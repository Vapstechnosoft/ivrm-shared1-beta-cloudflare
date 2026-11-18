import type { OutwardSchema } from '@/schemas/visitors-management/transactions';
import { deleteOutwardData, getOutwardData, saveOutwardData } from '@/server/visitors-management/transactions/outward';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useOutward = () => {
    const queryClient = useQueryClient();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['outwardData'],
        queryFn: () => getOutwardData()
    });

    const mutation = useMutation({
        mutationFn: (data: OutwardSchema) => saveOutwardData(data),
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message);
                queryClient.invalidateQueries({ queryKey: ['outwardData'] });
            } else {
                toast.error(res.message || 'Failed to save outward entry');
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error('An error occurred while saving.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteOutwardData(id),
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message);
                queryClient.invalidateQueries({ queryKey: ['outwardData'] });
            } else {
                toast.error(res.message || 'Failed to delete outward entry');
            }
        }
    });

    return {
        data,
        isLoading,
        refetch,
        saveOutward: mutation.mutateAsync,
        deleteOutward: deleteMutation.mutateAsync
    };
};
