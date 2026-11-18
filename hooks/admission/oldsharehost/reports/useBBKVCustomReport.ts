'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getBBKVCustomReportInitialDetails,
    getBBKVCustomReportStudentDetails,
    getBBKVCustomReportStudents,
    getBBKVCustomReportTCDetails
} from '@/server/admission/oldsharehost/reports/bbkv_custom_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useBBKVCustomReportInitialDetails = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'bbkv_custom_report_initial_details'],
        queryFn: getBBKVCustomReportInitialDetails
    });
};

export const useBBKVCustomReportStudents = () => {
    return useMutation({
        mutationFn: (payload: any) => getBBKVCustomReportStudents(payload)
    });
};

export const useBBKVCustomReportStudentDetails = () => {
    return useMutation({
        mutationFn: (payload: any) => getBBKVCustomReportStudentDetails(payload)
    });
};

export const useBBKVCustomReportTCDetails = () => {
    return useMutation({
        mutationFn: (payload: any) => getBBKVCustomReportTCDetails(payload)
    });
};
