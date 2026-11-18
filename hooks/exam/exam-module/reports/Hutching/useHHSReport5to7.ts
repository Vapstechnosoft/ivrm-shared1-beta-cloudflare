import {
    getHHSReport5to7ClassByYear,
    getHHSReport5to7Details,
    getHHSReport5to7SaveDetails,
    getHHSReport5to7SectionByClass,
    getHHSReport5to7Student
} from '@/server/exam/exam-module/reports/Hutching/hhs-report-5to7';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useHHSReport5to7Details = () => {
    return useQuery({
        queryKey: ['hhsReport5to7Details'],
        queryFn: getHHSReport5to7Details
    });
};

export const useHHSReport5to7ClassByYear = () => {
    return useMutation({
        mutationFn: (asmaY_Id: number) => getHHSReport5to7ClassByYear(asmaY_Id)
    });
};

export const useHHSReport5to7SectionByClass = () => {
    return useMutation({
        mutationFn: (data: { ASMCL_Id: number; ASMAY_Id: number }) => getHHSReport5to7SectionByClass(data)
    });
};

export const useHHSReport5to7Student = () => {
    return useMutation({
        mutationFn: (data: { ASMCL_Id: number; ASMAY_Id: number; ASMS_Id: number }) => getHHSReport5to7Student(data)
    });
};

export const useHHSReport5to7SaveDetails = () => {
    return useMutation({
        mutationFn: (payload: any) => getHHSReport5to7SaveDetails(payload)
    });
};
