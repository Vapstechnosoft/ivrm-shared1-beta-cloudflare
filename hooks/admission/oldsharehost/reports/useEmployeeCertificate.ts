import {
    getEmployeeCertificateInitialDetails,
    getEmployeeCertificateReport
} from '@/server/admission/oldsharehost/reports/employee_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useEmployeeCertificateInitialDetails() {
    return useQuery({
        queryKey: ['employeeCertificateInitialDetails'],
        queryFn: async () => {
            const response = await getEmployeeCertificateInitialDetails();
            return response;
        }
    });
}

export function useEmployeeCertificateReport() {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await getEmployeeCertificateReport(data);
            return response;
        }
    });
}
