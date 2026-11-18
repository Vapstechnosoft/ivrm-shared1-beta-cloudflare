import {
    getCbsCharacterCertDetails,
    getCbsStudyCertAcademicYearChange,
    getCbsStudyCertDetails,
    getCbsStudyCertLoadData,
    getCbsStudyCertSearchFilter,
    saveCbsStudyCertQRCode
} from '@/server/admission/preadmission/reports/cbs_study_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useCbsStudyCertLoadData = () => {
    return useQuery({
        queryKey: ['cbs-study-cert-load-data'],
        queryFn: () => getCbsStudyCertLoadData()
    });
};

export const useCbsStudyCertAcademicYearChange = () => {
    return useMutation({
        mutationFn: (data: { AMST_SOL: string; ASMAY_Id: number }) => getCbsStudyCertAcademicYearChange(data)
    });
};

export const useCbsStudyCertSearchFilter = () => {
    return useMutation({
        mutationFn: getCbsStudyCertSearchFilter
    });
};

export const useCbsStudyCertDetails = () => {
    return useMutation({
        mutationFn: getCbsStudyCertDetails
    });
};

export const useCbsCharacterCertDetails = () => {
    return useMutation({
        mutationFn: getCbsCharacterCertDetails
    });
};

export const useSaveCbsStudyCertQRCode = () => {
    return useMutation({
        mutationFn: saveCbsStudyCertQRCode
    });
};
