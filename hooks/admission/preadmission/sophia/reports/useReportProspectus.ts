import {
    getReportProspectusDetails,
    getReportProspectusInitialData,
    searchReportProspectus,
    sendMail,
    sendSms
} from '@/server/admission/preadmission/sophia/reports/report-prospectus';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useReportProspectusInitialData() {
    return useQuery({
        queryKey: ['reportProspectusInitialData'],
        queryFn: getReportProspectusInitialData
    });
}

export function useReportProspectusDetails() {
    return useMutation({
        mutationFn: getReportProspectusDetails
    });
}

export function useSearchReportProspectus() {
    return useMutation({
        mutationFn: searchReportProspectus
    });
}

export function useSendSms() {
    return useMutation({
        mutationFn: sendSms
    });
}

export function useSendMail() {
    return useMutation({
        mutationFn: sendMail
    });
}
