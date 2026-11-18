import {
    getSMSCConductCertLoadData,
    getSMSCConductCertReport,
    onSMSCConductCertBranchChange,
    onSMSCConductCertCourseChange,
    onSMSCConductCertSemesterChange,
    onSMSCConductCertYearChange,
    searchSMSCConductCertStudents
} from '@/server/admission/preadmission/reports/sms_conduct_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSMSCConductCertLoadData = () => {
    return useQuery({
        queryKey: ['smsc-conduct-cert-load-data'],
        queryFn: async () => await getSMSCConductCertLoadData()
    });
};

export const useSMSCConductCertYearChange = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number }) => await onSMSCConductCertYearChange(data)
    });
};

export const useSMSCConductCertCourseChange = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number }) => await onSMSCConductCertCourseChange(data)
    });
};

export const useSMSCConductCertBranchChange = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) => await onSMSCConductCertBranchChange(data)
    });
};

export const useSMSCConductCertSemesterChange = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number }) =>
            await onSMSCConductCertSemesterChange(data)
    });
};

export const useSMSCConductCertSearchFilter = () => {
    return useMutation({
        mutationFn: async (data: {
            filterinitialdata: string;
            searchfilter: string;
            ASMAY_Id: number;
            AMCST_SOL: string;
            AMCO_Id: number;
            AMB_Id: number;
            AMSE_Id: number;
            ACMS_Id: number;
            allorindid: string;
        }) => await searchSMSCConductCertStudents(data)
    });
};

export const useSMSCConductCertReport = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMCST_SOL: string;
            AMCO_Id: number;
            AMB_Id: number;
            AMSE_Id: number;
            ACMS_Id: number;
            AMCST_Id: number;
            allorindid: string;
        }) => await getSMSCConductCertReport(data)
    });
};
