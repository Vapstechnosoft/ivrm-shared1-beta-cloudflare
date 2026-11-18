'use server';

import { api } from '@/lib/apiService';

export interface HeadWiseReportRequest {
    hreS_Year: string;
    hreS_Month: string;
    hrmd_ids: number[];
    hrmgt_ids: number[];
    hrmdes_ids: number[];
}

export async function getHeadWiseEmployeeDetails(data: HeadWiseReportRequest) {
    try {
        const response = await api.post<any>('hrms', '/api/ReportHeadwise/get_head_wise_employee_details', data);
        return response;
    } catch (error) {
        console.error('Error fetching head wise employee details:', error);
        throw error;
    }
}
