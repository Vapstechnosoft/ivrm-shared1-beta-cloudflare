'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getSophiaStudyCertDetails,
    getSophiaStudyCertLoadData,
    getSophiaStudyCertSearchFilter
} from '@/server/admission/preadmission/reports/sophia_study_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSophiaStudyCertLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'sophia_study_cert', 'load_data'],
        queryFn: () => getSophiaStudyCertLoadData(),
        staleTime: 0
    });
};

export const useSophiaStudyCertDetails = () => {
    return useMutation({
        mutationFn: (data: any) => getSophiaStudyCertDetails(data)
    });
};

export const useSophiaStudyCertSearchFilter = () => {
    return useMutation({
        mutationFn: (data: any) => getSophiaStudyCertSearchFilter(data)
    });
};
