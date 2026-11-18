import type { InwardSchema } from '@/schemas/visitors-management/transactions';
import { deleteInwardData, getInwardData, saveInwardData } from '@/server/visitors-management/transactions/inward';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useInward = () => {
    const queryClient = useQueryClient();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['inwardData'],
        queryFn: () => getInwardData()
    });

    const mutation = useMutation({
        mutationFn: (data: InwardSchema) => saveInwardData(data),
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message);
                queryClient.invalidateQueries({ queryKey: ['inwardData'] });
            } else {
                toast.error(res.message || 'Failed to save inward entry');
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error('An error occurred while saving.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteInwardData(id),
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message);
                queryClient.invalidateQueries({ queryKey: ['inwardData'] });
            } else {
                toast.error(res.message || 'Failed to delete inward entry');
            }
        }
    });

    return {
        data,
        isLoading,
        refetch,
        saveInward: mutation.mutateAsync,
        deleteInward: deleteMutation.mutateAsync
    };
};
