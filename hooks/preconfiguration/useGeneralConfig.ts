import {
    deleteGeneralUsernameConfig,
    getGeneralConfigurationData,
    getGeneralConfigurationEditData,
    getGeneralConfigurationPageContent,
    saveGeneralConfiguration
} from '@/server/preconfiguration/general-config';
import type { IGeneralConfigurationResponse } from '@/types/preconfiguration/general-config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useGetGeneralConfiguration() {
    return useQuery<IGeneralConfigurationResponse>({
        queryKey: ['general-configuration'],
        queryFn: () => getGeneralConfigurationData()
    });
}

export function useGetGeneralConfigurationPageContent() {
    return useMutation({
        mutationFn: (ivrmP_Id: number) => getGeneralConfigurationPageContent(ivrmP_Id),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to fetch page content');
        }
    });
}

export function useGetGeneralConfigurationEdit(id: number) {
    return useQuery<IGeneralConfigurationResponse>({
        queryKey: ['general-configuration-edit', id],
        queryFn: () => getGeneralConfigurationEditData(id),
        enabled: !!id
    });
}

export function useSaveGeneralConfiguration() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveGeneralConfiguration(data),
        onSuccess: (response: any) => {
            if (response?.returnval) {
                toast.success(response.returnval as string);
            } else {
                toast.success('Configuration saved successfully');
            }
            queryClient.invalidateQueries({ queryKey: ['general-configuration'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save configuration');
        }
    });
}

export function useDeleteGeneralUsernameConfig() {
    return useMutation({
        mutationFn: (id: number) => deleteGeneralUsernameConfig(id),
        onSuccess: (response: any) => {
            if (response?.message === 'Success') {
                toast.success('Username config deleted successfully');
            } else {
                toast.error('Failed to delete username config');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete username config');
        }
    });
}
