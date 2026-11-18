'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/DocumentViewClg';

export async function getDocumentViewClgInitialData() {
    try {
        return await api.get<any>('collegepreadmission', `${BASE_URL}/getdetails`);
    } catch (error) {
        console.error('[Server] getDocumentViewClgInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function getRegisterReportClg(data: any) {
    const params = new URLSearchParams();
    if (data.ASMAY_Id) params.append('ASMAY_Id', data.ASMAY_Id.toString());
    if (data.From_Date) params.append('From_Date', data.From_Date);
    if (data.To_Date) params.append('To_Date', data.To_Date);

    return await api.post<any>('collegepreadmission', `${BASE_URL}/Getregdata?${params.toString()}`, data);
}

export async function getDocumentViewClgReport(data: any) {
    return await api.post<any>('collegepreadmission', `${BASE_URL}/getclgstudata`, data);
}

export async function getDocumentViewClgBranch(data: any) {
    return await api.post<any>('collegepreadmission', `${BASE_URL}/getbranch`, data);
}

export async function getDocumentViewClgSemester(data: any) {
    return await api.post<any>('collegepreadmission', `${BASE_URL}/getsemester`, data);
}
