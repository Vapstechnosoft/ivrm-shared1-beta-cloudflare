'use client';

import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { getCountStatusReportData, getCountStatusReportInitialDetails } from '@/server/admission/preadmission/reports/count_status_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useCountStatusReportInitialDetails = () => {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.PREADMISSION_STATUS_COUNT_REPORT, 'initial_details'],
        queryFn: getCountStatusReportInitialDetails
    });
};

export const useCountStatusReportData = () => {
    return useMutation({
        mutationFn: (payload: { ASMAY_Id: number }) => getCountStatusReportData(payload)
    });
};
