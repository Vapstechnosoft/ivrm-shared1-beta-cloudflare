'use client';

import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getDocumentViewReportData,
    getDocumentViewReportInitialDetails,
    getDocumentViewReportStudents
} from '@/server/admission/preadmission/reports/document_view_report_adm';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useDocumentViewReportInitialDetails = () => {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.DOCUMENT_VIEW, 'initial_details'],
        queryFn: getDocumentViewReportInitialDetails
    });
};

export const useDocumentViewReportStudents = () => {
    return useMutation({
        mutationFn: (payload: { asmaY_Id: number; asmcL_Id: number; asmS_Id: number }) => getDocumentViewReportStudents(payload)
    });
};

export const useDocumentViewReportData = () => {
    return useMutation({
        mutationFn: (payload: any) => getDocumentViewReportData(payload)
    });
};
