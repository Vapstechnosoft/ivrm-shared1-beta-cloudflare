'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getSophiaMultiTCDetails,
    getSophiaMultiTCGetReport,
    getSophiaMultiTCOnChangeClass,
    getSophiaMultiTCOnChangeSection,
    getSophiaMultiTCOnChangeYear
} from '@/server/admission/preadmission/reports/sophia_multi_transfer_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSophiaMultiTCLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'sophia_multi_tc', 'load_data'],
        queryFn: () => getSophiaMultiTCDetails(),
        staleTime: 0
    });
};

export const useSophiaMultiTCOnChangeYear = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => getSophiaMultiTCOnChangeYear(data)
    });
};

export const useSophiaMultiTCOnChangeClass = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number }) => getSophiaMultiTCOnChangeClass(data)
    });
};

export const useSophiaMultiTCOnChangeSection = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) => getSophiaMultiTCOnChangeSection(data)
    });
};

export const useSophiaMultiTCGetReport = () => {
    return useMutation({
        mutationFn: (data: any) => getSophiaMultiTCGetReport(data)
    });
};
