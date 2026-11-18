'use server';

import { api } from '@/lib/apiService';

export async function getSamarthaBonafideCertLoadData() {
    //return await api.get<any>('admission', '/StudyCertificate/get_loaddata');
    const url = '/StudyCertificate/get_loaddata';
    return await api.get<any>('admission', url);
}

export async function getSamarthaBonafideCertSearchFilter(data: {
    searchfilter: string;
    ASMAY_Id: number;
    AMST_SOL: string;
    ASMCL_Id: number;
    ASMC_Id: number;
    allorindid: string;
}) {
    const url = `/StudyCertificate/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMST_SOL=${data.AMST_SOL}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&searchfilter=${encodeURIComponent(data.searchfilter)}&allorindid=${data.allorindid}`;
    return await api.post<any>('admission', url, data);
}

export async function getSamarthaBonafideCertStudDetails(data: any) {
    // const url = '/StudyCertificate/Studdetails';
    // return await api.post<any>('admission', url, data);
    const url = `/StudyCertificate/getStudData?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function saveSamarthaBonafideCertQRCode(data: any) {
    return await api.post<any>('admission', '/QRcodeStudentCertificate/QRCODECertificates', data);
}
