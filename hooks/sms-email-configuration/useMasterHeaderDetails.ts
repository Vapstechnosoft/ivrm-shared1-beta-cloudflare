import {
    deleteMasterHeaderDetailsData,
    getMasterHeaderDetailsData,
    getModulePage,
    getSelectedRowDetails,
    saveMasterHeaderDetailsData
} from '@/server/sms-email-configuration/master-header-details';
import type { MasterHeaderDetailsPayload } from '@/types/sms-email-configuration/master-header-details';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useMasterHeaderDetailsData = () => {
    return useQuery({
        queryKey: ['master-header-details'],
        queryFn: () => getMasterHeaderDetailsData()
    });
};

export const useModulePage = (moduleId: number) => {
    return useQuery({
        queryKey: ['module-page', moduleId],
        queryFn: () => getModulePage(moduleId),
        enabled: !!moduleId
    });
};

export const useSaveMasterHeaderDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: MasterHeaderDetailsPayload) => saveMasterHeaderDetailsData(data),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || 'Record Saved Successfully');
            } else {
                if (data.message && data.message.toLowerCase().includes('exist')) {
                    toast.warning(data.message);
                } else {
                    toast.error(data.message || 'Failed To Save Record');
                }
            }
            queryClient.invalidateQueries({ queryKey: ['master-header-details'] });
        },
        onError: () => {
            toast.error('An error occurred');
        }
    });
};

export const useDeleteMasterHeaderDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMasterHeaderDetailsData(id),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || 'Deleted successfully');
            } else {
                toast.error(data.message || 'Failed to delete record');
            }
            queryClient.invalidateQueries({ queryKey: ['master-header-details'] });
        },
        onError: () => {
            toast.error('Failed to delete record');
        }
    });
};

export const useGetSelectedRowDetails = () => {
    return useMutation({
        mutationFn: (id: number) => getSelectedRowDetails(id)
    });
};
