'use server';

import { api } from '@/lib/apiService';
import type { IFeeChallanReportItem, IFeeChallanReportRequest, IFeeChallanReportResponse } from '@/types/fees/reports/reports';

export async function getFeeChallanReport(
    data: IFeeChallanReportRequest
): Promise<IFeeChallanReportResponse> {
    const url = '/FeeChallanReportFacade/getreport';
    try {
        const response = await api.post<any>('fees', url, data);

        // ✅ API returns { success, message, data: { reportdatelist: [...] } }
        if (response?.data?.reportdatelist) {
            return {
                success: response.success ?? true,
                message: response.message || 'Report fetched successfully',
                data: response.data  // ✅ data is the object with reportdatelist
            };
        }

        // ✅ Fallback if response itself has reportdatelist
        

        // ✅ Empty fallback
        return {
            success: true,
            message: 'No data found',
            data: { reportdatelist: [] }
        };

    } catch (error: any) {
        console.error('[server] getFeeChallanReport error:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch Fee Challan Report',
            data: { reportdatelist: [] }  // ✅ match the correct type
        };
    }
}
