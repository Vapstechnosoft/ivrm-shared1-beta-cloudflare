'use server';

import { api } from '@/lib/apiService';

export async function getSophiaStudentTCApprovalLoadData(data: { Flag: string }) {
    const url = data.Flag ? `/SMSApprovalTransaction/Getdata?Flag=${data.Flag}` : '/SMSApprovalTransaction/Getdata';
    return await api.post<any>('admission', url);
}

export async function getSophiaStudentTCApprovalDetails(data: { ASMAY_Id: number }) {
    const url = `/SMSApprovalTransaction/gettcdetails?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url);
}

export async function saveSophiaStudentTCApprovalData(data: {
    selectedTCDATAlist: { asca_Id: number; astca_Status: string; astca_Remarks: string }[];
}) {
    const url = '/SMSApprovalTransaction/saveTCdata';
    return await api.post<any>('admission', url, data);
}

export async function updateSophiaStudentTCApprovalIDs(data: { studentdata: any[] }) {
    const url = '/SMSApprovalTransaction/onchangeID';
    return await api.post<any>('admission', url, data);
}
