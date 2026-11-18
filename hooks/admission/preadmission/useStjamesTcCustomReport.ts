import {
    changeStjamesTcClass,
    changeStjamesTcSection,
    changeStjamesTcYear,
    getStjamesTcDetails,
    getStjamesTcLoadData
} from '@/server/admission/preadmission/reports/stjames_tc_custom_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const stjamesTcKeys = {
    all: ['stjames-tc-custom-report'] as const,
    load: () => [...stjamesTcKeys.all, 'load'] as const,
    report: (data: any) => [...stjamesTcKeys.all, 'report', data] as const
};

export const useStjamesTcLoadData = () => {
    return useQuery({
        queryKey: stjamesTcKeys.load(),
        queryFn: getStjamesTcLoadData,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

export const useStjamesTcYearChange = () => {
    return useMutation({
        mutationFn: changeStjamesTcYear
    });
};

export const useStjamesTcClassChange = () => {
    return useMutation({
        mutationFn: changeStjamesTcClass
    });
};

export const useStjamesTcSectionChange = () => {
    return useMutation({
        mutationFn: changeStjamesTcSection
    });
};

export const useStjamesTcReport = () => {
    return useMutation({
        mutationFn: getStjamesTcDetails
    });
};
