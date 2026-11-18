import {
    getNdaStudentTcApprovalStatus,
    getNdaStudentTcLoadData,
    getNdaStudentTcPdfData,
    getNdaStudentTcSearchList,
    getNdaStudentTcSections,
    saveNdaStudentTcData
} from '@/server/admission/preadmission/transactions/nda_student_tc';
import { useMutation, useQuery } from '@tanstack/react-query';

export const ndaStudentTcKeys = {
    all: ['nda-student-tc'] as const,
    initial: () => [...ndaStudentTcKeys.all, 'initial'] as const
};

/**
 * Hook to fetch initial data for NDA Student TC (Academic Years, Classes, Approved list)
 */
export const useNdaStudentTcInitialData = () => {
    return useQuery({
        queryKey: ndaStudentTcKeys.initial(),
        queryFn: () => getNdaStudentTcLoadData(),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

/**
 * Hook for class selection change
 */
export const useNdaStudentTcSections = () => {
    return useMutation({
        mutationFn: getNdaStudentTcSections
    });
};

/**
 * Hook to search student list during search grid
 */
export const useNdaStudentTcSearch = () => {
    return useMutation({
        mutationFn: getNdaStudentTcSearchList
    });
};

/**
 * Hook to save TC application requests
 */
export const useNdaStudentTcSave = () => {
    return useMutation({
        mutationFn: saveNdaStudentTcData
    });
};

/**
 * Hook to fetch TC PDF data for viewing/printing
 */
export const useNdaStudentTcPdf = () => {
    return useMutation({
        mutationFn: getNdaStudentTcPdfData
    });
};

/**
 * Hook to fetch approval status details
 */
export const useNdaStudentTcApprovalStatus = () => {
    return useMutation({
        mutationFn: getNdaStudentTcApprovalStatus
    });
};
