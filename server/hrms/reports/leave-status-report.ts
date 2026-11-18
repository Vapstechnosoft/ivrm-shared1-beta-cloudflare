'use server';

import { api } from '@/lib/apiService';

export interface LeaveStatusReportRequest {
    hrmlY_Id: string | number;
    hrml_Ids: string;
    hrme_Ids: string;
}

export async function getLeaveStatusReport(data: LeaveStatusReportRequest) {
    console.log('data', data);
    const url = `/api/LeaveStatusReport/get_leave_status_report`;
    try {
        const response = await api.post<any>('hmslms', url, data);
        if (response.success) {
            return {
                success: true,
                data: response.data,
                message: response.message
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch report',
            data: null
        };
    } catch (error: any) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch report',
            data: null
        };
    }
}

