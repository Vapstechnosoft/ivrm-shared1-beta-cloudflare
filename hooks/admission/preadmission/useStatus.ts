import {
    forgotOTPForEmailval,
    getStatusInitialData,
    saveStatusData,
    searchStatusData,
    verifyEmailOtpgen
} from '@/server/admission/preadmission/transactions/status';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useStatusInitialData = () => {
    return useQuery({
        queryKey: ['preadmission_status_initial_data'],
        queryFn: async () => getStatusInitialData(),
        staleTime: 0
    });
};

export const useSearchStatusData = () => {
    return useMutation({
        mutationFn: async (data: any) => searchStatusData(data)
    });
};

export const useSaveStatusData = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveStatusData(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preadmission_status_initial_data'] });
        }
    });
};

export const useForgotOTP = () => {
    return useMutation({
        mutationFn: async (data: any) => forgotOTPForEmailval(data)
    });
};

export const useVerifyOTP = () => {
    return useMutation({
        mutationFn: async (data: any) => verifyEmailOtpgen(data)
    });
};
