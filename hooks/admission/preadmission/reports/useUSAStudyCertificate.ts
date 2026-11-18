'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getUSAStudyCertReport,
    getUSAStudyCertificateLoadData,
    onUSAStudyCertBranchChange,
    onUSAStudyCertCourseChange,
    onUSAStudyCertSemesterChange,
    onUSAStudyCertYearChange,
    searchUSAStudyCertStudents
} from '@/server/admission/preadmission/reports/usa_study_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useUSAStudyCertLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'usa_study_certificate', 'load_data'],
        queryFn: () => getUSAStudyCertificateLoadData()
    });
};

export const useUSAStudyCertYearChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => onUSAStudyCertYearChange(data)
    });
};

export const useUSAStudyCertCourseChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number }) => onUSAStudyCertCourseChange(data)
    });
};

export const useUSAStudyCertBranchChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) => onUSAStudyCertBranchChange(data)
    });
};

export const useUSAStudyCertSemesterChange = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number }) => onUSAStudyCertSemesterChange(data)
    });
};

export const useUSAStudyCertSearchFilter = () => {
    return useMutation({
        mutationFn: (data: {
            ASMAY_Id: number;
            AMCST_SOL: string;
            AMCO_Id: number;
            AMB_Id: number;
            AMSE_Id: number;
            ACMS_Id: number;
            allorindid: string;
            searchfilter?: string;
            filterinitialdata?: string;
        }) => searchUSAStudyCertStudents(data)
    });
};

export const useUSAStudyCertReport = () => {
    return useMutation({
        mutationFn: (data: {
            ASMAY_Id: number;
            AMCST_SOL: string;
            AMCO_Id: number;
            AMB_Id: number;
            AMSE_Id: number;
            ACMS_Id: number;
            AMCST_Id: number;
            allorindid: string;
        }) => getUSAStudyCertReport(data)
    });
};
