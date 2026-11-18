'use server';

import { api } from '@/lib/apiService';
import type { IBankCopyReportParams, IBankCopyReportResponse } from '@/types/pettycash/report/BankCopyReport';

export async function getBankCopyReportInitialData() {
    const url = '/BankCopyReportVVVS/get_initial_data';
    return await api.get<any>('pettycashandassettracking', url);
}

export async function getBankCopyReport(data: IBankCopyReportParams) {
    const url = `/Expenses/get_bank_copy_report/${data.IVRM_Month_Id}/${data.ASMAY_Year}`;
    return await api.get<IBankCopyReportResponse>('pettycashandassettracking', url);
}

export async function getBankCopyReportDetails(data: any) {
    const url = '/FeesCommon/ivrm-month-list';
    return await api.post<any>('pettycashandassettracking', url, data);
}
