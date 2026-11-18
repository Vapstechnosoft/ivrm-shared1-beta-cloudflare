'use server';

import { api } from '@/lib/apiService';

export async function getCbsTcInitialData() {
    const url = '/StudenttcCustomReport/getinitialdata';
    return await api.get<any>('admission', url);
}

export async function changeCbsTcYear(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    search?: string;
}) {
    const url = `/StudenttcCustomReport/changeyear?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&report_type=${data.report_type}&admnoorname=${data.search || ''}`;
    return await api.get<any>('admission', url);
}

export async function changeCbsTcClass(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    ASMCL_Id: number;
    search?: string;
}) {
    const url = `/StudenttcCustomReport/changeclass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&admnoorname=${data.search || ''}`;
    return await api.get<any>('admission', url);
}

export async function changeCbsTcSection(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    ASMCL_Id: number;
    ASMS_Id: number;
    search?: string;
}) {
    const url = `/StudenttcCustomReport/changesection?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&admnoorname=${data.search || ''}`;
    return await api.get<any>('admission', url);
}

export async function getCbsTcDetails(data: {
    ASMAY_Id: number;
    AMST_Id: number;
    tctemporper: string;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    search?: string;
    report_type: string;
    Boardtype?: string;
    BSPID?: string;
    Previous_School_Name?: string;
}) {
    const url = `/StudenttcCustomReport/getTCdata?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id || 0}&ASMS_Id=${data.ASMS_Id || 0}&AMST_Id=${data.AMST_Id}&report_type=${data.report_type}&admnoorname=${data.search || ''}`;
    return await api.get<any>('admission', url);
}

export async function saveCbsTcCertificates(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    ASCISS_HtmlTemplate: string;
    ASCISS_CertificateFlg: string;
    ASCISS_QRCode: string;
}) {
    // Standard shared endpoint for QR code saving across pre-admission certificates
    const url = '/StudyCertificate/QRCODECertificates';
    return await api.post<any>('admission', url, data);
}

export async function getCbsTcStudentDetails(data: { AMST_Id: number; ASMAY_Id: number }) {
    const url = `/BBKVCustomReport/stdnamechange?ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, data);
}
