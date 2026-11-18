import {
    getNdaTcDetails,
    getNdaTcInitialData,
    getNdaTcStudentList,
    getNdaTcStudentNameChange,
    onNdaTcTempPerChange
} from '@/server/admission/preadmission/reports/nda_transfer_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const ndaTcKeys = {
    all: ['nda-tc-report'] as const,
    initial: () => [...ndaTcKeys.all, 'initial'] as const
};

/**
 * Hook to fetch initial data for NDA TC (Academic Years)
 */
export const useNdaTcInitialData = () => {
    return useQuery({
        queryKey: ndaTcKeys.initial(),
        queryFn: () => getNdaTcInitialData(),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

/**
 * Hook to search student list during selection
 */
export const useNdaTcStudentList = () => {
    return useMutation({
        mutationFn: getNdaTcStudentList
    });
};

/**
 * Hook to handle student profile name/regno change
 */
export const useNdaTcStudentNameChange = () => {
    return useMutation({
        mutationFn: getNdaTcStudentNameChange
    });
};

/**
 * Hook to handle student type change (perm/temp)
 */
export const useNdaTcTempPerChange = () => {
    return useMutation({
        mutationFn: onNdaTcTempPerChange
    });
};

/**
 * Hook to fetch final TC details for NDA TC report
 */
export const useNdaTcReportDetails = () => {
    return useMutation({
        mutationFn: getNdaTcDetails
    });
};
