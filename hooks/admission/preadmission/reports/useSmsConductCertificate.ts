'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
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
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'sms_conduct_cert', 'load_data'],
        queryFn: () => getSMSCConductCertLoadData(),
        staleTime: 5 * 60 * 1000
    });
};

export const useSMSCConductCertYearChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => onSMSCConductCertYearChange(data)
    });
};

export const useSMSCConductCertCourseChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number }) => onSMSCConductCertCourseChange(data)
    });
};

export const useSMSCConductCertBranchChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) => onSMSCConductCertBranchChange(data)
    });
};

export const useSMSCConductCertSemesterChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number }) => onSMSCConductCertSemesterChange(data)
    });
};

export const useSMSCConductCertSearch = () => {
    return useMutation({
        mutationFn: (data: any) => searchSMSCConductCertStudents(data)
    });
};

export const useSMSCConductCertReport = () => {
    return useMutation({
        mutationFn: (data: any) => getSMSCConductCertReport(data)
    });
};
