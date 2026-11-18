'use server';

import { api } from '@/lib/apiService';

export async function getSamarthaProgressCardReportPromotion(data: any) {
    try {
        const url = 'JSHSExamReports/nds_9_report';
        const response = await api.post<any>('exam', url, data);
        if (response && (response.success || response.data)) {
            return { success: true, data: response.data || response };
        }
        return { success: false, message: response?.message || 'Failed to fetch report data' };
    } catch (error: any) {
        console.error('Error in getSamarthaProgressCardReportPromotion:', error);
        return { success: false, message: error?.message || 'An error occurred while fetching report data' };
    }
}
