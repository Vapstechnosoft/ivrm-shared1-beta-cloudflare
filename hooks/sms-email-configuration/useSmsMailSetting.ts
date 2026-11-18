import {
    deleteSmsMailSetting,
    getHeader,
    getModulePage,
    getParameter,
    getSmsMailSettingData,
    getSmsMailSettingDetails,
    saveSmsMailSetting,
    toggleEmailActive,
    toggleSmsActive,
    viewEmailTemplate
} from '@/server/sms-email-configuration/sms-mail-setting';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useSmsMailSettingData() {
    return useQuery({
        queryKey: ['smsMailSettingData'],
        queryFn: () => getSmsMailSettingData()
    });
}

export function useModulePage(moduleId: number) {
    return useQuery({
        queryKey: ['modulePage', moduleId],
        queryFn: () => getModulePage(moduleId),
        enabled: !!moduleId
    });
}

export function useHeader(ivrmim_id: number, ivrmimp_id: number) {
    return useQuery({
        queryKey: ['header', ivrmim_id, ivrmimp_id],
        queryFn: () => getHeader(ivrmim_id, ivrmimp_id),
        enabled: !!ivrmim_id && !!ivrmimp_id
    });
}

export function useParameter(headerId: number) {
    return useQuery({
        queryKey: ['parameter', headerId],
        queryFn: () => getParameter(headerId),
        enabled: !!headerId
    });
}

export function useGetSmsMailSettingDetails() {
    return useMutation({
        mutationFn: (params: { ises_id: number; ivrmimp_id: number }) => getSmsMailSettingDetails(params.ises_id, params.ivrmimp_id)
    });
}

export function useSaveSmsMailSetting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => saveSmsMailSetting(data),
        onSuccess: (data) => {
            if (data.message === 'dup') {
                toast.error('Template Already Registered');
            } else if (data.returnval) {
                toast.success('Record Saved/Updated Successfully');
                queryClient.invalidateQueries({ queryKey: ['smsMailSettingData'] });
            } else {
                toast.error('Error saving record');
            }
        },
        onError: () => {
            toast.error('Failed to save record');
        }
    });
}

export function useDeleteSmsMailSetting() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteSmsMailSetting(id),
        onSuccess: (data) => {
            if (data.returnval) {
                toast.success('Record Deleted Successfully!');
                queryClient.invalidateQueries({ queryKey: ['smsMailSettingData'] });
            } else {
                toast.error('Failed to Delete Record!');
            }
        },
        onError: () => {
            toast.error('Failed to Delete Record!');
        }
    });
}

export function useToggleSmsActive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => toggleSmsActive(data.iseS_Id),
        onSuccess: (data, variables) => {
            if (data.message) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: ['smsMailSettingData'] });
            } else if (data.success || data.returnval) {
                toast.success(`SMS Settings toggled Successfully`);
                queryClient.invalidateQueries({ queryKey: ['smsMailSettingData'] });
            } else {
                toast.error('Failed to Update SMS Settings');
            }
        }
    });
}

export function useToggleEmailActive() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => toggleEmailActive(data.iseS_Id),
        onSuccess: (data, variables) => {
            if (data.message) {
                toast.success(data.message);
                queryClient.invalidateQueries({ queryKey: ['smsMailSettingData'] });
            } else if (data.success || data.returnval) {
                toast.success(`Email Settings toggled Successfully`);
                queryClient.invalidateQueries({ queryKey: ['smsMailSettingData'] });
            } else {
                toast.error('Failed to Update Email Settings');
            }
        }
    });
}

export function useViewEmailTemplate() {
    return useMutation({
        mutationFn: (ismhtml_id: number) => viewEmailTemplate(ismhtml_id)
    });
}
