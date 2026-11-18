'use server';
import { api } from '@/lib/apiService';

export async function getStudyCertificateLoadData() {
    const url = '/StudyCertificate/get_loaddata';
    return await api.get<any>('admission', url);
}

export async function getStudyCertificateStudentList(data: any) {
    const url = `/StudyCertificate/getstudentlist?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}&AMST_SOL=${data.AMST_SOL}`;
    return await api.post<any>('admission', url, {});
}

export async function getStudyCertificateDetails(data: any) {
    const url = `/StudyCertificate/getStudData?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getStudyCertificateAcademicYearChange(data: any) {
    const url = `/StudyCertificate/onacademicyearchange?AMST_SOL=${data.AMST_SOL}&ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getStudyCertificateConductDetails(data: any) {
    let url = `/StudyCertificate/Studdetailsconduct?ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    if (data.ASMCL_Id && data.ASMC_Id) {
        url += `&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}`;
    }
    return await api.post<any>('admission', url, {});
}

export async function getStudyCertificateSearchFilterSRKVS(data: any) {
    const url = `/StudyCertificate/searchfilterSRKVS?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&searchfilter=${data.searchfilter}`;
    return await api.post<any>('admission', url, {});
}

export async function getStudyCertificateSearchFilter(data: any) {
    const url = `/StudyCertificate/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMST_SOL=${data.AMST_SOL}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&searchfilter=${data.searchfilter}&allorindid=${data.allorindid}`;
    return await api.post<any>('admission', url, {});
}

export async function getStudyCertificateQR(data: any) {
    const url = '/StudyCertificate/QRCODECertificates';
    return await api.post<any>('admission', url, data);
}

/**
 * Fetches Study Certificate details for BCEH (Baldwin Co-Education)
 */
export async function getBcehStudyCertDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
}) {
    const url = `/StudyCertificate/getStudData?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, {});
}
