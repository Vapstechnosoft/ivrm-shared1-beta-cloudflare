import {
    getBbkvCustomReportDetails,
    getBbkvCustomReportNameRegNo,
    getBbkvCustomReportStdNameChange,
    getBbkvCustomReportTcDetails,
    getBbkvCustomReportTempPerChange
} from '@/server/admission/preadmission/reports/bbkv_custom_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGetBbkvCustomReportDetails = () => {
    return useQuery({
        queryKey: ['bbkvCustomReportDetails'],
        queryFn: async () => await getBbkvCustomReportDetails()
    });
};

export const useGetBbkvCustomReportNameRegNo = () => {
    return useMutation({
        mutationFn: async (data: {
            admnoorname: string;
            ASMAY_Id: number;
            tctemporper: string;
            ASMCL_Id?: number;
            ASMS_Id?: number;
        }) => await getBbkvCustomReportNameRegNo(data)
    });
};

export const useGetBbkvCustomReportStdNameChange = () => {
    return useMutation({
        mutationFn: async (data: { AMST_Id: number; ASMAY_Id: number }) => await getBbkvCustomReportStdNameChange(data)
    });
};

export const useGetBbkvCustomReportTempPerChange = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; admnoorname: string; tctemporper: string }) =>
            await getBbkvCustomReportTempPerChange(data)
    });
};

export const useGetBbkvCustomReportTcDetails = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMST_Id: number; tctemporper: string }) => await getBbkvCustomReportTcDetails(data)
    });
};
