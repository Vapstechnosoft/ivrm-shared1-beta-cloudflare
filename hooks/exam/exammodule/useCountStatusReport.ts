'use client';

import { EXAM_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCountStatusReportDetails,
    getCountStatusReportInitialDetails
} from '@/server/exam/exam-module/reports/Hutching/count-status-report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useCountStatusReportInitialDetails = () => {
    return useQuery({
        queryKey: [EXAM_QUERY_KEYS.COUNT_STATUS_REPORT, 'count_status_initial'],
        queryFn: getCountStatusReportInitialDetails,
        staleTime: 60 * 1000
    });
};

export const useCountStatusReportDetails = () => {
    return useMutation({
        mutationFn: (payload: { ASMAY_Id: number }) => getCountStatusReportDetails(payload)
    });
};
