'use server';

import { api } from '@/lib/apiService';

// The api payload structure takes: ASMAY_Id, ASMCL_Id, ASMS_Id, Temp_AmstIds, EMPG_GroupName, reporttype
export async function getPromotionCumulativeReport(data: any) {
    const url = '/JSHSExamReports_/stthomos_promotion_report_card';
    try {
        const response = await api.post<any>('exam', url, data);
        console.log('JSHSExamReports_/stthomos_promotion_report_card response', response?.message || 'Success');
        return response.data;
    } catch (error) {
        console.error('getPromotionCumulativeReport API Error:', error);
        throw error;
    }
}
