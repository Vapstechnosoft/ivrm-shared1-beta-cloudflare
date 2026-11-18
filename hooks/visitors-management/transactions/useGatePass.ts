import type { GatePassSchema } from '@/schemas/visitors-management/transactions';
import { getGatePassData, saveGatePassData } from '@/server/visitors-management/transactions/gate-pass';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useGatePass = () => {
    const queryClient = useQueryClient();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['gatePassData'],
        queryFn: () => getGatePassData()
    });

    const mutation = useMutation({
        mutationFn: (data: GatePassSchema) => saveGatePassData(data),
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message);
                queryClient.invalidateQueries({ queryKey: ['gatePassData'] });
            } else {
                toast.error(res.message || 'Failed to generate gate pass');
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error('An error occurred while generating.');
        }
    });

    return {
        data,
        isLoading,
        refetch,
        saveGatePass: mutation.mutateAsync
    };
};
