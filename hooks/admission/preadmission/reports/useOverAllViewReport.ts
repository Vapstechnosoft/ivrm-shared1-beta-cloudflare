'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { getOverAllViewReportData, getOverAllViewReportInitialDetails } from '@/server/admission/preadmission/reports/over_all_view_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useOverAllViewReportInitialDetails = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.OVER_ALL_VIEW_REPORT, 'initial_details'],
        queryFn: getOverAllViewReportInitialDetails
    });
};

export const useOverAllViewReportData = () => {
    return useMutation({
        mutationFn: (payload: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMS_Id: number;
            stdmobilenumber: string;
        }) => getOverAllViewReportData(payload)
    });
};
