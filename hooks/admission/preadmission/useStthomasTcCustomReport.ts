import {
    changeStthomasTcClass,
    changeStthomasTcSection,
    changeStthomasTcYear,
    getStthomasTcDetails,
    getStthomasTcLoadData
} from '@/server/admission/preadmission/reports/stthomas_tc_custom_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const stthomasTcKeys = {
    all: ['stthomas-tc-custom-report'] as const,
    load: () => [...stthomasTcKeys.all, 'load'] as const
};

export const useStthomasTcLoadData = () => {
    return useQuery({
        queryKey: stthomasTcKeys.load(),
        queryFn: getStthomasTcLoadData,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

export const useStthomasTcYearChange = () => {
    return useMutation({
        mutationFn: changeStthomasTcYear
    });
};

export const useStthomasTcClassChange = () => {
    return useMutation({
        mutationFn: changeStthomasTcClass
    });
};

export const useStthomasTcSectionChange = () => {
    return useMutation({
        mutationFn: changeStthomasTcSection
    });
};

export const useStthomasTcReport = () => {
    return useMutation({
        mutationFn: getStthomasTcDetails
    });
};
