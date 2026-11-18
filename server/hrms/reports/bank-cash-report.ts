'use server';

import { api } from '@/lib/apiService';

/**
 * Bank Cash Report Request
 */
export interface BankCashReportRequest {
    hreS_Year: number;
    hreS_Month: string;
    bankCash: string;
    hrmd_ids: number[];
    hrmgt_ids: number[];
    hrmdes_ids: number[];
}

/**
 * Fetch Employees Bank Cash Report Data
 * POST /api/ReportBankCash/get_employees_bank_cash_report
 */
export async function getEmployeesBankCashReport(data: BankCashReportRequest) {
    try {
        const response = await api.post<any>('hrms', '/api/ReportBankCash/get_employees_bank_cash_report', data);
        if (response.success) return { success: true, data: response.data };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
