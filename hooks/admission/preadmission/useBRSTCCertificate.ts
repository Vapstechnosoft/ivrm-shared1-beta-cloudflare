import {
    getBbkvCustomReportDetails,
    getBbkvCustomReportNameRegNo,
    getBbkvCustomReportStdNameChange,
    getBbkvCustomReportTcDetails,
    getBbkvCustomReportTempPerChange
} from '@/server/admission/preadmission/reports/bbkv_custom_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useBRSTCCertificateInitialDetails = () => {
    return useQuery({
        queryKey: ['brs-tc-certificate-initial-details'],
        queryFn: () => getBbkvCustomReportDetails(2)
    });
};

export const useBRSTCCertificateSearch = () => {
    return useMutation({
        mutationFn: (data: { admnoorname: string; ASMAY_Id: number; tctemporper: string }) => getBbkvCustomReportNameRegNo(data)
    });
};

export const useBRSTCCertificateStdChange = () => {
    return useMutation({
        mutationFn: (data: { AMST_Id: number; ASMAY_Id: number }) => getBbkvCustomReportStdNameChange(data)
    });
};

export const useBRSTCCertificateTempPerChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; admnoorname: string; tctemporper: string }) => getBbkvCustomReportTempPerChange(data)
    });
};

export const useBRSTCCertificateTcDetails = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMST_Id: number; tctemporper: string }) => getBbkvCustomReportTcDetails(data)
    });
};
