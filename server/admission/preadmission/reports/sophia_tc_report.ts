'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/BBKVCustomReport';

export async function getTCInitialData() {
    const url = `${BASE_URL}/getdetails`;
    return await api.get<any>('admission', url);
}

export async function onTCYearChange(data: { ASMAY_Id: number }) {
    const url = `${BASE_URL}/onchangeyear?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.get<any>('admission', url);
}
export async function onTCClassChange(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = `${BASE_URL}/onchangeclass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}`;
    return await api.get<any>('admission', url);
}

export async function onTCSectionChange(data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    const url = `${BASE_URL}/onchangesection?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    return await api.post<any>('admission', url);
}

export async function getStudentNameRegNo(data: {
    admnoorname: string;
    ASMAY_Id: number;
    tctemporper: string;
    ASMCL_Id?: number;
    ASMS_Id?: number;
}) {
    const url = `${BASE_URL}/getnameregno?tctemporper=${data.tctemporper}&admnoorname=${data.admnoorname}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id || 0}&ASMS_Id=${data.ASMS_Id || 0}`;
    return await api.post<any>('admission', url);
}

export async function onStudentNameChange(data: { AMST_Id: number; ASMAY_Id: number }) {
    const url = `${BASE_URL}/stdnamechange?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, data);
}

export async function getTCDetailsRecord(data: { ASMAY_Id: number; AMST_Id: number; tctemporper: string }) {
    const url = `${BASE_URL}/getTcdetails?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url);
}

export async function getTCReportDetails(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    studentTempList: { amsT_Id: number; studentName: string }[];
}) {
    const url = `${BASE_URL}/GetReportdetails`;
    return await api.post<any>('admission', url, data);
}
