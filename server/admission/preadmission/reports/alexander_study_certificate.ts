'use server';
import { api } from '@/lib/apiService';

export async function getAlexanderStudyCertificateLoadData() {
    const url = '/StudyCertificate/get_loaddata';
    return await api.get<any>('admission', url);
}

export async function getAlexanderStudyCertificateSearchFilter(data: any) {
    const url = `/StudyCertificate/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMST_SOL=${data.AMST_SOL}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&searchfilter=${data.searchfilter}&allorindid=${data.allorindid}`;
    return await api.post<any>('admission', url, {});
}

export async function getAlexanderStudyCertDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
}) {
    const url = `/StudyCertificate/getStudData?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, {});
}
