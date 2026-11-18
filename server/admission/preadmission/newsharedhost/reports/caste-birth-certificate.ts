'use server';

import { api } from '@/lib/apiService';

export async function getCasteBirthCertificateInitialData() {
    return await api.get<any>('admission', '/StudyCertificate/get_loaddata');
}

export async function searchCasteBirthStudent(data: {
    searchfilter: string;
    ASMAY_Id: number;
    AMST_SOL: string;
    ASMCL_Id: number;
    ASMC_Id: number;
    allorindid: string;
}) {
    const url = `/StudyCertificate/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMST_SOL=${data.AMST_SOL}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&searchfilter=${data.searchfilter}&allorindid=${data.allorindid}`;
    return await api.post<any>('admission', url, {});
}

export async function getCasteBirthStudentReport(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    save_flag: boolean;
}) {
    const url = `/StudyCertificate/Studdetailsconduct?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&AMST_Id=${data.AMST_Id}&AMC_Id=0&save_flag=${data.save_flag}`;
    return await api.post<any>('admission', url, {});
}

export async function generateCasteBirthQRCode(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    CertificateDate: Date;
    ASCISS_HtmlTemplate: string;
    ASCISS_CertificateFlg: string;
    ASCISS_QRCode: string;
}) {
    return await api.post<any>('admission', '/QRcodeStudentCertificate/QRCODECertificates', data);
}
