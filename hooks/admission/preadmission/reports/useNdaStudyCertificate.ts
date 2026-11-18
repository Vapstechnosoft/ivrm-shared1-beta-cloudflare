import {
    getNdaStudyCertDetails,
    getNdaStudyCertLoadData,
    getNdaStudyCertSearchFilter
} from '@/server/admission/preadmission/reports/nda_study_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useNdaStudyCertLoadData() {
    return useQuery({
        queryKey: ['ndaStudyCertLoadData'],
        queryFn: async () => {
            const response = await getNdaStudyCertLoadData();
            return response;
        }
    });
}

export function useNdaStudyCertSearchFilter() {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMST_SOL: string;
            ASMCL_Id: number;
            ASMC_Id: number;
            searchfilter: string;
            allorindid: string;
            filterinitialdata?: string;
        }) => {
            const response = await getNdaStudyCertSearchFilter(data);
            return response;
        }
    });
}

export function useNdaStudyCertDetails() {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMC_Id: number;
            AMST_Id: number;
        }) => {
            const response = await getNdaStudyCertDetails(data);
            return response;
        }
    });
}
