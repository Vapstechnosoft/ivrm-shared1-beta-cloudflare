'use server';

import { api } from '@/lib/apiService';

export async function getDocumentViewReportInitialDetails() {
    const url = `/DocumentViewReportAdm/getdetails/2`;
    return await api.get<any>('preadmission', url);
}

export async function getDocumentViewReportStudents(data: { asmaY_Id: number; asmcL_Id: number; asmS_Id: number }) {
    const url = `/DocumentViewReportAdm/getstudent/`;
    return await api.post<any>('preadmission', url, data);
}

export async function getDocumentViewReportData(data: any) {
    const url = `/DocumentViewReportAdm/getreport/`;
    return await api.post<any>('preadmission', url, data);
}
