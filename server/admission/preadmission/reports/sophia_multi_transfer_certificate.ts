'use server';

import { api } from '@/lib/apiService';

export async function getSophiaMultiTCDetails() {
    const url = `/BBKVCustomReport/getdetails`;
    return await api.get<any>('admission', url);
}

export async function getSophiaMultiTCOnChangeYear(data: { ASMAY_Id: number }) {
    const url = `/BBKVCustomReport/onchangeyear?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.get<any>('admission', url);
}

export async function getSophiaMultiTCOnChangeClass(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = `/BBKVCustomReport/onchangeclass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}`;
    return await api.get<any>('admission', url);
}

export async function getSophiaMultiTCOnChangeSection(data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    const url = `/BBKVCustomReport/onchangesection?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    return await api.post<any>('admission', url);
}

export async function getSophiaMultiTCGetReport(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    studentTempList: { amsT_Id: number; studentName: string }[];
}) {
    const url = '/BBKVCustomReport/GetReportdetails';
    return await api.post<any>('admission', url, data);
}
