'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data for Student ID Card Details (Years, Classes)
 */
export async function onLoadIdCardDetails() {
    const url = `/StudentIdCardFormat/OnLoadStudentIdCardDetails`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

/**
 * Fetches Class list when Year is changed
 */
export async function onChangeYear(data: { ASMAY_Id: number }) {
    const url = `/StudentIdCardFormat/OnChangeYear?ASMAY_Id=${data.ASMAY_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

/**
 * Fetches Section list when Class is changed
 */
export async function onChangeClass(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = `/StudentIdCardFormat/OnChangeClass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

/**
 * Fetches Student list when Section is changed
 */
export async function onChangeSection(data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    const url = `/StudentIdCardFormat/OnChangeSection?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

/**
 * Fetches final Report details for ID Cards
 */
export async function getIdCardReport(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    StudentTempList: any[];
}) {
    const url = '/StudentIdCardFormat/GetReportDetails';
    const res = await api.post<any>('admission', url, data);
    return res?.data || res;
}
