'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getSamarthaBonafideCertLoadData,
    getSamarthaBonafideCertSearchFilter,
    getSamarthaBonafideCertStudDetails,
    saveSamarthaBonafideCertQRCode
} from '@/server/admission/preadmission/reports/samartha_bonafide_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSamarthaBonafideCertLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'samartha_bonafide_cert', 'load_data'],
        queryFn: () => getSamarthaBonafideCertLoadData(),
        staleTime: 0
    });
};

export const useSamarthaBonafideCertSearchFilter = () => {
    return useMutation({
        mutationFn: (data: any) => getSamarthaBonafideCertSearchFilter(data)
    });
};

export const useSamarthaBonafideCertStudDetails = () => {
    return useMutation({
        mutationFn: (data: any) => getSamarthaBonafideCertStudDetails(data)
    });
};

export const useSaveSamarthaBonafideCertQRCode = () => {
    return useMutation({
        mutationFn: (data: any) => saveSamarthaBonafideCertQRCode(data)
    });
};
