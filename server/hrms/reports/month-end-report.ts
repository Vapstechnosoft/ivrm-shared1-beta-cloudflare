'use server';

import { api } from '@/lib/apiService';

export interface MonthEndReportRequest {
    hreS_Year: number;
    hreS_Month: string;
    hrmd_ids: number[];
    hrmgt_ids: number[];
    hrmdes_ids: number[];
}

export interface MonthEndReportData {
    institutionDetails: any;
    workingEmployeeCount: number;
    leftEmployeeCount: number;
    newEmployeeCount: number;
    missingPhotoWorking: number;
    missingEmailWorking: number;
    missingMobileWorking: number;
    missingPhotoLeft: number;
    missingEmailLeft: number;
    missingMobileLeft: number;
    missingPhotoNew: number;
    missingEmailNew: number;
    missingMobileNew: number;
    salaryGenerated: number;
    salarySlipGenerated: number;
    emailCount: number;
    smsCount: number;
    monthEndPath: string;
    returnMessage: string | null;
}

export async function getMonthEndReport(data: MonthEndReportRequest) {
    try {
        const response = await api.post<MonthEndReportData>('hrms', '/api/ReportMonthEnd/get_month_end_report', data);
        if (response.success) return { success: true, data: response.data };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to fetch month end report' };
    }
}
