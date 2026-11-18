'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    exportTotalStrengthReportToExcel,
    getMasterCompany,
    getTotalStrengthClasses,
    getTotalStrengthElectives,
    getTotalStrengthInitialDetails,
    getTotalStrengthReportDetails,
    getTotalStrengthSections
} from '@/server/admission/preadmission/reports/total_strength';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSTCSTotalStrengthInitialDetails = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT, 'initial_details'],
        queryFn: () => getTotalStrengthInitialDetails(),
        staleTime: 0
    });
};

export const useSTCSTotalStrengthElectives = (asmay_id: number) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT, 'electives', asmay_id],
        queryFn: () => getTotalStrengthElectives(asmay_id),
        staleTime: 0,
        enabled: !!asmay_id
    });
};

export const useSTCSTotalStrengthClasses = (asmay_id: number, amc_id: number) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT, 'classes', asmay_id, amc_id],
        queryFn: () => getTotalStrengthClasses(asmay_id, amc_id),
        staleTime: 0,
        enabled: !!asmay_id && !!amc_id
    });
};

export const useSTCSTotalStrengthSections = (asmay_id: number, asmcl_id: number, amc_id: number) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT, 'sections', asmay_id, asmcl_id, amc_id],
        queryFn: () => getTotalStrengthSections(asmay_id, asmcl_id, amc_id),
        staleTime: 0,
        enabled: !!asmay_id && !!asmcl_id && !!amc_id
    });
};

export const useSTCSTotalStrengthReportDetails = (data: any) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT, 'stcs_report', data],
            queryFn: () => getTotalStrengthReportDetails(data),
            staleTime: 0,
            enabled: !!data && !!data.ASMAY_Id
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT]
            })
    };
};

export const useSTCSExportTotalStrengthReport = () => {
    return useMutation({
        mutationFn: (data: any) => exportTotalStrengthReportToExcel(data)
    });
};

export const useSTCSTotalStrengthMasterCompany = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TOTAL_STRENGTH_REPORT, 'master_company'],
        queryFn: () => getMasterCompany(),
        staleTime: 0
    });
};
