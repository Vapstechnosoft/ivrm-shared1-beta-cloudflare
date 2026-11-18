'use client';

import {
    getStudentYearLossReportData,
    getStudentYearLossReportInitialDetails
} from '@/server/admission/oldsharehost/reports/student_year_loss_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useStudentYearLossReportInitialDetails = () => {
    return useQuery({
        queryKey: ['STUDENT_YEAR_LOSS_REPORT', 'initial_details'],
        queryFn: getStudentYearLossReportInitialDetails
    });
};

export const useStudentYearLossReportData = () => {
    return useMutation({
        mutationFn: (payload: any) => getStudentYearLossReportData(payload)
    });
};
