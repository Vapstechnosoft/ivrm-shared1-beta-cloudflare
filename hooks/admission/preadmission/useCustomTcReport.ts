import {
    getCustomTcChangeClass,
    getCustomTcChangeSection,
    getCustomTcDetails,
    getCustomTcInitialData,
    getCustomTcStudentList,
    getCustomTcStudentNameChange,
    onCustomTcTempPerChange
} from '@/server/admission/preadmission/reports/custom_tc_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const customTcKeys = {
    all: ['custom-tc-report'] as const,
    initial: () => [...customTcKeys.all, 'initial'] as const
};

/**
 * Hook to fetch initial data (Academic Years, etc.)
 */
export const useCustomTcInitialData = () => {
    return useQuery({
        queryKey: customTcKeys.initial(),
        queryFn: () => getCustomTcInitialData(),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

/**
 * Hook to fetch student list
 */
export const useCustomTcStudentList = () => {
    return useMutation({
        mutationFn: getCustomTcStudentList
    });
};

export const useCustomTcChangeClass = () => {
    return useMutation({
        mutationFn: getCustomTcChangeClass
    });
};

export const useCustomTcChangeSection = () => {
    return useMutation({
        mutationFn: getCustomTcChangeSection
    });
};

/**
 * Hook to handle student name change details
 */
export const useCustomTcStudentNameChange = () => {
    return useMutation({
        mutationFn: getCustomTcStudentNameChange
    });
};

/**
 * Hook to handle temp/permanent student radio change
 */
export const useCustomTcTempPerChange = () => {
    return useMutation({
        mutationFn: onCustomTcTempPerChange
    });
};

/**
 * Hook to fetch final TC details
 */
export const useCustomTcReportDetails = () => {
    return useMutation({
        mutationFn: getCustomTcDetails
    });
};
