'use server';

import { api } from '@/lib/apiService';

export async function getCBSNoObjectionLoadData() {
    return await api.get<any>('admission', `/HHSStudyCertificate/getdetails/`);
}

export async function getCBSNoObjectionStudentStatusChange(data: {
    AMST_SOL: string;
}) {
    return await api.post<any>('admission', `/HHSStudyCertificate/getstudentlist?AMST_SOL=${data.AMST_SOL}`, {});
}

export async function getCBSNoObjectionAcademicYearChange(data: {
    ASMAY_Id: number;
    AMST_SOL: string;
}) {
    const url = `/HHSStudyCertificate/onacademicyearchange?AMST_SOL=${data.AMST_SOL}&ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getCBSNoObjectionSearchFilter(data: {
    searchfilter: string;
    ASMAY_Id: number;
    AMST_SOL: string;
    ASMCL_Id: number;
    ASMS_Id: number;
    allorindid: string;
}) {
    const url = `/HHSStudyCertificate/searchfilter?AMST_SOL=${data.AMST_SOL}&allorindid=${data.allorindid}&searchfilter=${data.searchfilter}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getCBSNoObjectionStudDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    AMST_Id: number;
    save_flag: boolean;
}) {
    const url = `/HHSStudyCertificate/MigrationCertificateStuddetails?AMST_Id=${data.AMST_Id}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&save_flag=${data.save_flag}`;
    return await api.post<any>('admission', url, {});
}

export async function saveCBSNoObjectionQRCode(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    ASCISS_HtmlTemplate: string;
    ASCISS_CertificateFlg: string;
    ASCISS_QRCode: string;
}) {
    return await api.post<any>('admission', '/StudyCertificate/QRCODECertificates', data);
}
