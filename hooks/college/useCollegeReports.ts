import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getDocumentViewClgInitialData,
    getDocumentViewClgReport,
    getRegisterReportClg,
    getDocumentViewClgBranch,
    getDocumentViewClgSemester
} from '@/server/college/CollegePreadmission/Reports/document-view-clg';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useDocumentViewClgInitialData = () => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.REGISTER_REPORT_YEAR_LIST],
        queryFn: async () => getDocumentViewClgInitialData(),
        staleTime: 0
    });
};

export const useRegisterReportClg = () => {
    return useMutation({
        mutationFn: async (data: any) => getRegisterReportClg(data)
    });
};

export const useDocumentViewClgReport = () => {
    return useMutation({
        mutationFn: async (data: any) => getDocumentViewClgReport(data)
    });
};

export const useDocumentViewClgBranch = () => {
    return useMutation({
        mutationFn: async (data: any) => getDocumentViewClgBranch(data)
    });
};

export const useDocumentViewClgSemester = () => {
    return useMutation({
        mutationFn: async (data: any) => getDocumentViewClgSemester(data)
    });
};
