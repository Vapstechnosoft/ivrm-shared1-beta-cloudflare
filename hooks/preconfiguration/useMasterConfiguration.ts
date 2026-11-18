import {
    deleteMasterConfiguration,
    getMasterConfigurationData,
    getMasterConfigurationEditData,
    saveMasterConfiguration
} from '@/server/preconfiguration/master-configuration';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const QUERY_KEYS = {
    masterConfiguration: ['masterConfiguration']
} as const;

export function useMasterConfiguration() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: QUERY_KEYS.masterConfiguration,
        queryFn: async () => {
            const response = await getMasterConfigurationData();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch master configuration data');
            }
            return response.data;
        }
    });

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.masterConfiguration });
    };

    return {
        ...query,
        refetchAll: invalidateQueries
    };
}

export function useMasterConfigurationEdit(id: number | null) {
    return useQuery({
        queryKey: [...QUERY_KEYS.masterConfiguration, 'edit', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await getMasterConfigurationEditData(id);
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch master configuration edit data');
            }
            return response.data;
        },
        enabled: !!id
    });
}

export function useSaveMasterConfiguration() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveMasterConfiguration,
        onSuccess: (response) => {
            const msg = response.message || '';
            const isActuallySuccess = response.success || msg.toLowerCase().includes('success');

            if (isActuallySuccess) {
                toast.success(msg || 'Configuration saved successfully');
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.masterConfiguration });
            } else {
                toast.error(msg || 'Failed to save configuration');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while saving configuration');
        }
    });
}

export function useDeleteMasterConfiguration() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteMasterConfiguration,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Configuration deleted successfully');
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.masterConfiguration });
            } else {
                toast.error(response.message || 'Failed to delete configuration');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred while deleting configuration');
        }
    });
}
