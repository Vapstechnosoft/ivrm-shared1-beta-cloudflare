'use server';

import { api } from '@/lib/apiService';

/**
 * Loan Report Request
 */
export interface LoanReportRequest {
    hrmE_Ids: string;
    hrelT_Year: number | string;
    hrelT_Month: string | number;
}

/**
 * Fetch Employees Loan Report Data
 * POST /api/ReportLoan/get_employees_loan_report
 */
export async function getEmployeesLoanReport(data: LoanReportRequest) {
    try {
        const response = await api.post<any>('hrms', '/api/ReportEmployeeLoanReport/get_employee_loan_report', data);
        if (response.success) return { success: true, data: response.data };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
