'use server';

import { api } from '@/lib/apiService';

export async function getStpeterStudentIdCardLoadData() {
    const url = `/StudentIdCardFormat/OnLoadStudentIdCardDetails`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}
export async function changeYearStpeterStudentIdCard(data: { ASMAY_Id: number }) {
    const url = `/StudentIdCardFormat/OnChangeYear?ASMAY_Id=${data.ASMAY_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

export async function changeClassStpeterStudentIdCard(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = `/StudentIdCardFormat/OnChangeClass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

export async function changeSectionStpeterStudentIdCard(data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    const url = `/StudentIdCardFormat/OnChangeSection?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

export async function getStpeterStudentIdCardReport(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    StudentTempList: any[];
}) {
    const url = '/StudentIdCardFormat/GetReportDetails';
    const res = await api.post<any>('admission', url, data);
    return res?.data || res;
}
