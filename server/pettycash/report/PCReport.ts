'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IPDAReportParams, IPDAReportResponse } from '@/types/pettycash/report/PDAReport';

//incomereport

export async function getPDAReportInitialData() {
    const session = await auth();
    const mi_id = session?.mi_id || 2;
    const url = `/PDAReport/getalldetails/${mi_id}`;
    return await api.get<IPDAReportResponse>('pettycashandassettracking', url);
}

export async function getPDAReport(data: IPDAReportParams) {
    const url = `/Expenses/get_daily_income_expense_report/${data.From_Date}`;
    console.log('url', url);
    console.log('data', data);
    return await api.get<IPDAReportResponse>('pettycashandassettracking', url);
}

export async function getAcademicYearList() {
    const url = '/PDACommonFacade/GetAcademicYearData';
    // /api/PDACommonFacade/GetAcademicYearData
    return await api.get<any[]>('pettycashandassettracking', url);
}

export async function getinstitutionDetails() {
    const url = '/FeesCommon/institution-details';
    return await api.get<any[]>('fees', url);
}
