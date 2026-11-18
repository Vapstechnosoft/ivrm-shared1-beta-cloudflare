'use server';

import { api } from '@/lib/apiService';

export async function getStaffWiseReportInitialData() {
    return await api.get<any>('exam', '/LP_OE_StaffWiseExamReport/getloaddata');
}

export async function getNotSubmittedReportData(data: any) {
    return await api.post<any>('exam', '/LP_OE_StaffWiseExamReport/getnotsubmittedreport', data);
}

export async function getStaffWiseReportData(data: any) {
    return await api.post<any>('exam', '/LP_OE_StaffWiseExamReport/getstaffwisereport', data);
}

