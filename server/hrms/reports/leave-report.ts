'use server';

import { api } from '@/lib/apiService';

export interface LeaveReportRequest {
    selectedLeave?: string;
    selectedEmployee?: string;
    hreltD_FromDate?: string;
    hrelT_ToDate?: string;
    edit_flag?: boolean;
}

export async function getLeaveReport(data: LeaveReportRequest) {
    const url = `/api/LeaveReport/get_leave_report`;
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
