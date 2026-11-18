'use server';

import { api } from '@/lib/apiService';
import type { ICountStatusInitialData, ICountStatusReportData } from '@/types/exam/exam-module/reports/count-status-report';

/**
 * Get initial academic years data for Count Status Report
 * Calls [HttpPost("getInitailData")] on HutchingReports controller with [FromBody] payload
 */
export async function getCountStatusReportInitialDetails(data: any = {}) {
    try {
        const url = '/HutchingReports/getInitailData';
        const response = await api.post<ICountStatusInitialData>('exam', url, data || {});
        return response;
    } catch (error) {
        console.error('getCountStatusReportInitialDetails error:', error);
        return { academicList: [], yearlist: [] } as any;
    }
}

/**
 * Get report details for Count Status Report
 */
export async function getCountStatusReportDetails(data: { ASMAY_Id: number }) {
    try {
        const url = '/countstatusreport/Getdetails';
        const response = await api.post<ICountStatusReportData>('preadmission', url, data);
        return response;
    } catch (error) {
        try {
            const fallbackUrl = `/countstatusreport/Getdetail?ASMAY_Id=${data.ASMAY_Id}`;
            return await api.post<ICountStatusReportData>('preadmission', fallbackUrl, {});
        } catch (fb1Error) {
            try {
                const examUrl = '/HutchingReports/Getdetails';
                return await api.post<ICountStatusReportData>('exam', examUrl, data);
            } catch (fb2Error) {
                console.error('getCountStatusReportDetails fallback error:', fb2Error);
                throw fb2Error;
            }
        }
    }
}
