import {
    getAlexanderStudyCertDetails,
    getAlexanderStudyCertificateLoadData,
    getAlexanderStudyCertificateSearchFilter
} from '@/server/admission/preadmission/reports/alexander_study_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useAlexanderStudyCertLoadData = () => {
    return useQuery({
        queryKey: ['alexanderStudyCertLoadData'],
        queryFn: async () => {
            return await getAlexanderStudyCertificateLoadData();
        }
    });
};

export const useAlexanderStudyCertSearchStudent = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMST_SOL: string;
            ASMCL_Id: number;
            ASMC_Id: number;
            searchfilter: string;
            allorindid: string;
        }) => {
            return await getAlexanderStudyCertificateSearchFilter(data);
        }
    });
};

export const useAlexanderStudyCertDetails = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMC_Id: number;
            AMST_Id: number;
        }) => {
            return await getAlexanderStudyCertDetails(data);
        }
    });
};
