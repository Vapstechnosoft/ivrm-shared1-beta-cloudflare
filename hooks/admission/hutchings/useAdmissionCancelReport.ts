import {
    getAdmissionCancelReportByYear,
    getAdmissionCancelReportInitialDetails
} from '@/server/admission/hutchings/reports/admission_cancel_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useAdmissionCancelReportInitialDetails() {
    return useQuery({
        queryKey: ['admissionCancelReportInitialDetails'],
        queryFn: () => getAdmissionCancelReportInitialDetails()
    });
}

export function useAdmissionCancelReportByYearMutation() {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => getAdmissionCancelReportByYear(data)
    });
}
