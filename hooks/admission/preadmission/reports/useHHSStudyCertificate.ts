import {
    getHHSStudyCertDetails,
    getHHSStudyCertificateLoadData,
    getHHSStudyCertificateSearchFilter
} from '@/server/admission/preadmission/reports/hhs_study_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useHHSStudyCertLoadData = () => {
    return useQuery({
        queryKey: ['hhsStudyCertLoadData'],
        queryFn: async () => {
            return await getHHSStudyCertificateLoadData();
        }
    });
};

export const useHHSStudyCertSearchStudent = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMST_SOL: string;
            ASMCL_Id: number;
            ASMC_Id: number;
            searchfilter: string;
            allorindid: string;
        }) => {
            return await getHHSStudyCertificateSearchFilter(data);
        }
    });
};

export const useHHSStudyCertDetails = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMC_Id: number;
            AMST_Id: number;
        }) => {
            return await getHHSStudyCertDetails(data);
        }
    });
};
