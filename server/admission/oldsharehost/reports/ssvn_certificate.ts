'use server';

import { api } from '@/lib/apiService';

export async function getSSVNCertificateInitialDetails() {
    const url = `/HHSStudyCertificate/getdetails`;
    return await api.get<any>('admission', url);
}

export async function getSSVNCertificateStudentsByStatus(data: {
    AMST_SOL: string;
}) {
    return await api.post<any>('admission', `/HHSStudyCertificate/getstudentlist?AMST_SOL=${data.AMST_SOL}`, {});
}

export async function getSSVNCertificateStudentsByYear(data: {
    ASMAY_Id: number;
    AMST_SOL: string;
}) {
    const url = `/HHSStudyCertificate/onacademicyearchange?AMST_SOL=${data.AMST_SOL}&ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getSSVNCertificateStudentsByFilter(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    AMST_SOL: string;
    searchfilter: string;
    allorindid: string;
}) {
    const url = `/HHSStudyCertificate/searchfilter?AMST_SOL=${data.AMST_SOL}&allorindid=${data.allorindid}&searchfilter=${data.searchfilter}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getSSVNCertificateReportDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    AMST_Id: number;
    save_flag: string;
}) {
    const url = `/HHSStudyCertificate/getStudData?AMST_Id=${data.AMST_Id}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&save_flag=${data.save_flag}`;
    return await api.post<any>('admission', url, {});
}
