import { getAdmissionStandardData, saveAdmissionStandardData } from '@/server/preconfiguration/admission-standard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const QUERY_KEYS = {
    admissionStandard: ['admissionStandard']
} as const;

export function useAdmissionStandard() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: QUERY_KEYS.admissionStandard,
        queryFn: async () => {
            const response = await getAdmissionStandardData();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch admission standard data');
            }
            return response.data;
        }
    });

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admissionStandard });
    };

    return {
        ...query,
        refetchAll: invalidateQueries
    };
}

export function useSaveAdmissionStandard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveAdmissionStandardData,
        onSuccess: (response) => {
            const msg = response.message || '';
            const isActuallySuccess = response.success || msg.toLowerCase().includes('success');

            if (isActuallySuccess) {
                toast.success(msg || 'Record Saved Successfully');
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admissionStandard });
            } else {
                toast.error(msg || 'Failed to save configuration');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while saving configuration');
        }
    });
}
