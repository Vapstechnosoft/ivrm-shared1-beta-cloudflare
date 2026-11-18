'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data (Academic Years, Classes, etc.) for NDA Student TC
 */
export async function getNdaStudentTcLoadData() {
    const url = '/StudentTc/NDATCloaddata';
    const res = await api.post<any>('admission', url, { TCData: 1 });
    return res?.data || res;
}

/**
 * Fetches section list based on academic year and class
 */
export async function getNdaStudentTcSections(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = '/StudentTc/NDAonchangeclass';
    const res = await api.post<any>('admission', url, data);
    return res?.data || res;
}

/**
 * Searches for student list for TC application
 */
export async function getNdaStudentTcSearchList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
}) {
    const url = `/StudentTc/NDAStudentlistdata?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

/**
 * Saves student TC applications
 */
export async function saveNdaStudentTcData(data: {
    studentTCdata: any[];
    tcflagexists: string;
    transnumconfigsettings: any;
}) {
    const url = '/StudentTc/NDASavestudentTCdata';
    const res = await api.post<any>('admission', url, data);
    return res?.data || res;
}

/**
 * Fetches TC PDF data for viewing
 */
export async function getNdaStudentTcPdfData(data: { AMST_Id: number; ASMAY_Id?: number }) {
    const url = `/StudentTc/tcpdf?AMST_Id=${data.AMST_Id}${data.ASMAY_Id ? `&ASMAY_Id=${data.ASMAY_Id}` : ''}`;
    const res = await api.post<any>('admission', url, {});
    return res?.data || res;
}

/**
 * Fetches approval status view details
 */
export async function getNdaStudentTcApprovalStatus(data: { AMST_Id: number; ASMAY_Id: number }) {
    const url = `/StudentTc/viewstatus?AMST_Id=${data.AMST_Id}&ASMAY_Id=${data.ASMAY_Id}`;
    const res = await api.get<any>('admission', url);
    return res?.data || res;
}
