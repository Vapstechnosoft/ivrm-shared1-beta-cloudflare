'use server';

import { api } from '@/lib/apiService';

/**
 * Loads initial data for GDARS Study Certificate Report (Year, Class, Section lists)
 */
export async function getGDARSStudyCertLoadData() {
    const url = '/StudyCertificate/get_loaddata';
    return await api.get<any>('admission', url);
}

/**
 * Searches for students based on filter criteria
 */
export async function getGDARSStudyCertSearchFilter(data: {
    ASMAY_Id: number;
    AMST_SOL: string;
    ASMCL_Id: number;
    ASMC_Id: number;
    searchfilter: string;
    allorindid: string;
    filterinitialdata?: string;
}) {
    // Following the pattern in other migrations where searchfilter uses a POST with body
    // const url = '/StudyCertificate/searchfilter';
    // return await api.post<any>('admission', url, data);
    const url = `/StudyCertificate/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMST_SOL=${data.AMST_SOL}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&searchfilter=${data.searchfilter}&allorindid=${data.allorindid}`;
    return await api.post<any>('admission', url, {});
}

/**
 * Fetches the student details for the study certificate report
 */
export async function getGDARSStudyCertDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
}) {
    // const url = '/StudyCertificate/Studdetails';
    // return await api.post<any>('admission', url, data);
    const url = `/StudyCertificate/getStudData?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, {});
}
