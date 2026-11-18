'use server';

import { api } from '@/lib/apiService';

export interface salaryCertificateRequest {
    hreS_Month: string;
    hreS_Year: string;
    hrmE_Id: number;
}

export interface salaryCertificateEmployeesRequest {
    hreS_Month: string;
    hreS_Year: string;
    hrmdeS_IdList: number[];
    hrmD_IdList: number[];
    groupTypeIdList: number[];
}

export async function getSalaryCertificateReport(data: salaryCertificateRequest) {
    try {
        const response = await api.post<any>('hrms', '/api/ReportEmployeeSalaryDetails/generate_employee_salary_certificate', data);
        if (response.success) return { success: true, data: response.data };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getSalaryCertificateEmployees(data: salaryCertificateEmployeesRequest) {
    try {
        const response = await api.post<any>(
            'hrms',
            '/api/ReportEmployeeSalaryDetails/emp_dropdown_for_salary_certificate_by_month_year',
            data
        );
        if (response.success) return { success: true, data: response.data, message: response.message };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
