'use server';

import { api } from '@/lib/apiService';

/**
 * Final Promotion Report Chinmaya IX Server Actions
 */

export async function getFinalPromReportChinmayI_IX(data: any) {
    try {
        const url = '/JSHSExamReports/BBHS_IX_20202021';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch (error) {
        console.error('getFinalPromReportChinmayI_IX error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report'
        };
    }
}
