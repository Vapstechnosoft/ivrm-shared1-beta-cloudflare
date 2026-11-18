import type { AppointmentApprovalSchema, FeedbackSchema } from '@/schemas/visitors-management/appointment-approval-schema';
import {
    getAppointmentApprovalData,
    saveAppointmentApproval,
    saveFeedback,
    sendMOM
} from '@/server/visitors-management/transactions/appointment-approval';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAppointmentApproval = () => {
    const queryClient = useQueryClient();

    const loadData = useQuery({
        queryKey: ['appointment-approval-data'],
        queryFn: () => getAppointmentApprovalData()
    });

    const saveDataMutation = useMutation({
        mutationFn: (data: AppointmentApprovalSchema) => saveAppointmentApproval(data),
        onSuccess: (data) => {
            if (data.returnVal === 'updated') {
                toast.success('Record Saved Successfully');
                queryClient.invalidateQueries({ queryKey: ['appointment-approval-data'] });
            } else if (data.returnVal === 'ex') {
                toast.error('Already Appoint is fixed for other Visitor');
            } else if (data.returnVal === 'duplicate') {
                toast.error('Record already exist');
            } else {
                toast.error(data.message || 'Failed to save record');
            }
        },
        onError: (error) => {
            toast.error('An error occurred while saving');
        }
    });

    const saveFeedbackMutation = useMutation({
        mutationFn: (data: FeedbackSchema) => saveFeedback(data),
        onSuccess: (data) => {
            if (data.success) {
                toast.success('Feedback Updated Successfully');
            } else {
                toast.error('Failed to update feedback');
            }
        }
    });

    const sendMOMMutation = useMutation({
        mutationFn: (data: any) => sendMOM(data),
        onSuccess: (data) => {
            if (data.success) {
                toast.success('MoM Sent Successfully');
            } else {
                toast.error('Error sending MoM');
            }
        }
    });

    return {
        loadData,
        saveData: saveDataMutation.mutateAsync,
        isSaving: saveDataMutation.isPending,
        saveFeedback: saveFeedbackMutation.mutateAsync,
        sendMOM: sendMOMMutation.mutateAsync
    };
};
