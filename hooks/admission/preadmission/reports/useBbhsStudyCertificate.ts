import {
    getStudyCertificateAcademicYearChange,
    getStudyCertificateDetails,
    getStudyCertificateLoadData,
    getStudyCertificateSearchFilter
} from '@/server/admission/preadmission/reports/study_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useBbhsStudyCertLoadData = () => {
    return useQuery({
        queryKey: ['bbhs-study-cert-load-data'],
        queryFn: () => getStudyCertificateLoadData()
    });
};

export const useBbhsStudyCertAcademicYearChange = () => {
    return useMutation({
        mutationFn: (data: { AMST_SOL: string; ASMAY_Id: number }) => getStudyCertificateAcademicYearChange(data)
    });
};

export const useBbhsStudyCertSearchFilter = () => {
    return useMutation({
        mutationFn: getStudyCertificateSearchFilter
    });
};

export const useBbhsStudyCertDetails = () => {
    return useMutation({
        mutationFn: getStudyCertificateDetails
    });
};
