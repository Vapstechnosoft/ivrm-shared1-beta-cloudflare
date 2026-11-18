import {
    generateCasteBirthQRCode,
    getCasteBirthCertificateInitialData,
    getCasteBirthStudentReport,
    searchCasteBirthStudent
} from '@/server/admission/preadmission/newsharedhost/reports/caste-birth-certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useCasteBirthCertificateInitialData() {
    return useQuery({
        queryKey: ['casteBirthCertificateInitialData'],
        queryFn: () => getCasteBirthCertificateInitialData()
    });
}

export function useSearchCasteBirthStudentMutation() {
    return useMutation({
        mutationFn: (data: any) => searchCasteBirthStudent(data)
    });
}

export function useCasteBirthStudentReportMutation() {
    return useMutation({
        mutationFn: (data: any) => getCasteBirthStudentReport(data)
    });
}

export function useGenerateCasteBirthQRCodeMutation() {
    return useMutation({
        mutationFn: (data: any) => generateCasteBirthQRCode(data)
    });
}
