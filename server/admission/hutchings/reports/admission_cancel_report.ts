'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches the initial details (Academic Year) for the Admission Cancel Report.
 */
export async function getAdmissionCancelReportInitialDetails() {
    const url = '/StudentAdmission/OnLoadAdmissionCancelReport/2';
    return await api.get<any>('admission', url);
}

/**
 * Fetches the report data when the academic year changes.
 */
export async function getAdmissionCancelReportByYear(data: {
    ASMAY_Id: number;
}) {
    const url = `/StudentAdmission/OnChangeAdmissionCancelReportYear`;
    return await api.post<any>('admission', url, data);
}
