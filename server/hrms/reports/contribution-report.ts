'use server';
import { api } from '@/lib/apiService';

/**
 * Contribution Report Request
 */
export interface ContributionReportRequest {
    hrmdeS_Ids: string;
    hrmD_Ids: string;
    hrmgT_Ids: string;
    monthBetweenDates: 'Month' | 'BetweenDates';
    hreS_Month: string;
    hreS_Year: string;
    fromDate: string;
    toDate: string;
    formatType: string;
    hrmE_Id: number;
    earningDeduction: 'Earning' | 'Deduction';
    earningHead: string | number;
    deductionHead: string | number;
}

/**
 * Fetch Contribution Report Data
 * POST /api/ReportEmployeeContribution/get_employees_contribution_report
 */
export async function getContributionReport(data: ContributionReportRequest) {
    try {
        const response = await api.post<any>('hrms', '/api/ReportEmployeeContribution/get_employees_contribution_report', data);
        if (response.success) return { success: true, data: response.data };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Contribution Employees Request
 */

export interface ContributionEmployeesRequest {
    formatType: string;
    monthBetweenDates: 'Month' | 'BetweenDates';
    hrmdeS_Ids: string;
    hrmD_Ids: string;
    hrmgT_Ids: string;
    fromDate: string;
    toDate: string;
    hreS_Month: string;
    hreS_Year: string;
}

/**
 * Fetch Contribution Employees Data
 * POST /api/ReportContribution/get_contribution_employees
 */
export async function getContributionEmployees(data: ContributionEmployeesRequest) {
    try {
        const response = await api.post<any>('hrms', '/api/ReportEmployeeContribution/get_contribution_employees', data);
        if (response.success) return { success: true, data: response.data };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
