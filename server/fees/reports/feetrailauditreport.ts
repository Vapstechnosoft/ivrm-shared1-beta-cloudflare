'use server';

import { api } from '@/lib/apiService';

export async function getStudentandReceiptDropDown(filtertype: string, search: string, asmayId: number) {
    const url = `/FeeTrailAuditReportFacade/searchfilterData/${filtertype}/${search}/${asmayId}/`;
    return await api.get<any>('fees', url);
}

export async function getStudentandReceiptReport(payload: any) {
    const url = '/FeeTrailAuditReportFacade/FeeTrailAuditReportData';
    return await api.post<any>('fees', url, payload);
}
