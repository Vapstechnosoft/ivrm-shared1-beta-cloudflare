import {
    getBonafiedAcademicYearChange,
    getBonafiedLoadData,
    getBonafiedSearchFilter,
    getBonafiedStudDetails,
    getBonafiedStudentStatusChange
} from '@/server/admission/preadmission/reports/alexander_bonafied_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const bonafiedReportKeys = {
    all: ['alexander-bonafied-report'] as const,
    load: () => [...bonafiedReportKeys.all, 'load'] as const
};

export const useBonafiedLoadData = () => {
    return useQuery({
        queryKey: bonafiedReportKeys.load(),
        queryFn: getBonafiedLoadData,
        staleTime: 1000 * 60 * 5
    });
};

export const useBonafiedStudentStatusChange = () => {
    return useMutation({
        mutationFn: getBonafiedStudentStatusChange
    });
};

export const useBonafiedAcademicYearChange = () => {
    return useMutation({
        mutationFn: getBonafiedAcademicYearChange
    });
};

export const useBonafiedSearchFilter = () => {
    return useMutation({
        mutationFn: getBonafiedSearchFilter
    });
};

export const useBonafiedStudDetails = () => {
    return useMutation({
        mutationFn: getBonafiedStudDetails
    });
};
