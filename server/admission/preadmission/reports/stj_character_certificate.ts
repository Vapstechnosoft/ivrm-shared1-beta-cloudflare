'use server';

import { api } from '@/lib/apiService';

export async function getCharacterLoadData() {
    try {
        const res = await api.get<any>('admission', '/StudyCertificate/get_loaddata');

        return res;
    } catch (e: any) {
        throw e;
    }
}

export async function getCharacterSearchFilter(data: {
    filterinitialdata: string;
    searchfilter: string;
    ASMAY_Id: number;
    AMST_SOL: string;
    ASMCL_Id: number;
    ASMS_Id: number;
    allorindid: string;
}) {
    const url = `/HHSStudyCertificate/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMST_SOL=${data.AMST_SOL}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&searchfilter=${data.searchfilter}&allorindid=${data.allorindid}`;

    try {
        const res = await api.post<any>('admission', url, {});

        return res;
    } catch (e: any) {
        throw e;
    }
}

export async function getCharacterStudDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
}) {
    // Exact mapping confirmed by Swagger URL provided by user
    const url = `/StudyCertificate/getStudData?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}`;
    console.info('🔍 [SERVER] getCharacterStudDetails INITIATED');
    console.info('🔍 [SERVER] Target URL:', url);

    try {
        const res = await api.post<any>('admission', url, {});

        return res;
    } catch (e: any) {
        throw e;
    }
}
