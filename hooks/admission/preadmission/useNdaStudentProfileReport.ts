import {
    getNdaStudentProfileInitialData,
    getNdaStudentProfileReport
} from '@/server/admission/preadmission/reports/nda_student_profile_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const ndaStudentProfileReportKeys = {
    all: ['nda-student-profile-report'] as const,
    initial: () => [...ndaStudentProfileReportKeys.all, 'initial'] as const
};

/**
 * Hook to fetch initial data for NDA Student Profile Status Report
 */
export const useNdaStudentProfileInitialData = () => {
    return useQuery({
        queryKey: ndaStudentProfileReportKeys.initial(),
        queryFn: () => getNdaStudentProfileInitialData(),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

/**
 * Hook to fetch student or staff profile status report
 */
export const useNdaStudentProfileReport = () => {
    return useMutation({
        mutationFn: getNdaStudentProfileReport
    });
};
