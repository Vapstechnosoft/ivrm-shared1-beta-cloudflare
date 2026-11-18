import {
    deleteHtmlTemplateData,
    editHtmlTemplateData,
    getHtmlTemplatesData,
    saveHtmlTemplateData
} from '@/server/sms-email-configuration/master-html-templates';
import type { HtmlTemplatePayload } from '@/types/sms-email-configuration/master-html-templates';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useHtmlTemplatesData = () => {
    return useQuery({
        queryKey: ['html-templates-data'],
        queryFn: () => getHtmlTemplatesData()
    });
};

export const useSaveHtmlTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: HtmlTemplatePayload) => saveHtmlTemplateData(data),
        onSuccess: (data: any) => {
            if (data.success || data.returnval) {
                toast.success(data.message || 'Record Saved Successfully');
            } else {
                if (data.message && data.message.toLowerCase().includes('exist')) {
                    toast.warning(data.message);
                } else {
                    toast.error(data.message || 'Failed To Save Record');
                }
            }
            queryClient.invalidateQueries({ queryKey: ['html-templates-data'] });
        },
        onError: () => {
            toast.error('An error occurred');
        }
    });
};

export const useDeleteHtmlTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { ismhtmL_Id: number; ismhtmL_ActiveFlg: boolean }) => deleteHtmlTemplateData(data),
        onSuccess: (data: any) => {
            const msg = data.message?.toLowerCase() || '';
            if (msg.includes('deactivated')) {
                toast.error(data.message);
            } else if (msg.includes('activated') || data.success || data.returnval) {
                toast.success(data.message || 'Updated Successfully');
            } else {
                toast.error(data.message || 'Failed to update');
            }
            queryClient.invalidateQueries({ queryKey: ['html-templates-data'] });
        },
        onError: () => {
            toast.error('An error occurred while changing status');
        }
    });
};

export const useEditHtmlTemplate = () => {
    return useMutation({
        mutationFn: (data: { ismhtmL_Id: number }) => editHtmlTemplateData(data)
    });
};
