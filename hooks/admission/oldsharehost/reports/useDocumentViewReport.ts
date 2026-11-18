import {
    getDocumentViewReportData,
    getDocumentViewReportDetails,
    getDocumentViewReportStudent
} from '@/server/admission/oldsharehost/reports/document_view_adm';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useDocumentViewReportInitialDetails = () => {
    return useQuery({
        queryKey: ['documentViewReportInitialDetails'],
        queryFn: () => getDocumentViewReportDetails()
    });
};

export const useDocumentViewReportStudent = () => {
    return useMutation({
        mutationFn: getDocumentViewReportStudent
    });
};

export const useDocumentViewReportData = () => {
    return useMutation({
        mutationFn: getDocumentViewReportData
    });
};
