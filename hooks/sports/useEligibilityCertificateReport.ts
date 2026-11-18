import {
    generateEligibilityCertificateReport,
    getAge,
    getClasses,
    getEligibilityCertificateReport,
    getSections,
    getStudents
} from '@/server/sports/reports/eligibility-certificate-report';
import type { IEligibilityCertificateReport } from '@/types/sports/reports/eligibility-certificate-report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useEligibilityCertificateReport = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['eligibilityCertificateReport'],
        queryFn: () => getEligibilityCertificateReport()
    });

    const getClassesMutation = useMutation({
        mutationFn: (data: any) => getClasses(data)
    });

    const getSectionsMutation = useMutation({
        mutationFn: (data: any) => getSections(data)
    });

    const getStudentsMutation = useMutation({
        mutationFn: (data: any) => getStudents(data)
    });

    const getAgeMutation = useMutation({
        mutationFn: (data: any) => getAge(data)
    });

    const generateReportMutation = useMutation({
        mutationFn: (data: IEligibilityCertificateReport) => generateEligibilityCertificateReport(data)
    });

    return {
        data,
        isLoading,
        error,
        refetch,
        getClasses: getClassesMutation,
        getSections: getSectionsMutation,
        getStudents: getStudentsMutation,
        getAge: getAgeMutation,
        generateReport: generateReportMutation
    };
};
