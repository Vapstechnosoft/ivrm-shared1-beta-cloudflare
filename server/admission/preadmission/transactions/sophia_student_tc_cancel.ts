'use server';

import { api } from '@/lib/apiService';

export async function getSophiaStudentTCCancelLoadData() {
    const url = '/StudentTc/GetTCCancelDetails';
    return await api.post<any>('admission', url);
}

export async function getSophiaStudentTCCancelOnChangeYear(asmayId: number) {
    const url = `/StudentTc/OnChangeAcademicYear?ASMAY_Id=${asmayId}`;
    return await api.post<any>('admission', url);
}

export async function getSophiaStudentTCCancelOnStudentChange(asmayId: number, amstId: number) {
    const url = `/StudentTc/OnStudentNameChange?AMST_Id=${amstId}&ASMAY_Id=${asmayId}`;
    return await api.post<any>('admission', url);
}

export async function saveSophiaStudentTCCancelDetails(data: { AMST_Id: number; ASMAY_Id: number; TC_CancelReason: string }) {
    const url = `/StudentTc/SaveTCCancelDetails?AMST_Id=${data.AMST_Id}&ASMAY_Id=${data.ASMAY_Id}&TC_CancelReason=${encodeURIComponent(data.TC_CancelReason)}`;
    return await api.post<any>('admission', url);
}
