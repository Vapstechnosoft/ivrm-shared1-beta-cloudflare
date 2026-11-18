'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getGDARSStudyCertDetails,
    getGDARSStudyCertLoadData,
    getGDARSStudyCertSearchFilter
} from '@/server/admission/preadmission/reports/gnanadeepa_study_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGDARSStudyCertLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'gnanadeepa_study_cert', 'load_data'],
        queryFn: () => getGDARSStudyCertLoadData(),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

export const useGDARSStudyCertSearchFilter = () => {
    return useMutation({
        mutationFn: (data: any) => getGDARSStudyCertSearchFilter(data)
    });
};

export const useGDARSStudyCertDetails = () => {
    return useMutation({
        mutationFn: (data: any) => getGDARSStudyCertDetails(data)
    });
};
