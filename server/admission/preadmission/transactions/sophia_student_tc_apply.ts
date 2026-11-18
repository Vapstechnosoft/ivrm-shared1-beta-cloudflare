'use server';

import { api } from '@/lib/apiService';

export async function getSophiaStudentTCApplyLoadData(data: { TCData: number }) {
    const url = '/StudentTc/NDATCloaddata';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaStudentTCApplyOnChangeClass(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = '/StudentTc/NDAonchangeclass';
    const res = await api.post<any>('admission', url, data);
    return res?.data || res;
}

export async function getSophiaStudentTCApplyStudentList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
}) {
    const url = `/StudentTc/NDAStudentlistdata?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

export async function saveSophiaStudentTCApply(data: {
    studentTCdata: any[];
    tcflagexists: string;
    transnumconfigsettings: any;
}) {
    const url = '/StudentTc/NDASavestudentTCdata';
    const res = await api.post<any>('admission', url, data);
    return res?.data || res;
}

export async function getSophiaStudentTCTCPdf(data: { AMST_Id: number }) {
    const url = `/StudentTc/tcpdf?AMST_Id=${data.AMST_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}
export async function getSophiaStudentTCViewStatus(data: { AMST_Id: number; ASMAY_Id: number }) {
    const url = `/StudentTc/viewstatus?AMST_Id=${data.AMST_Id}&ASMAY_Id=${data.ASMAY_Id}`;
    const res = await api.get<any>('admission', url);
    return res?.data || res;
}
