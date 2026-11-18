'use server';

import { api } from '@/lib/apiService';

export async function getPromotionReportSophia(data: any) {
    try {
        const url = '/JSHSExamReports_/nds_6_8_report';
        const payload = {
            ASMAY_Id: data.asmaY_Id,
            ASMCL_Id: data.asmcL_Id,
            ASMS_Id: data.asmS_Id,
            from_date: data.from_date,
            to_date: data.to_date,
            Temp_AmstIds: data.studentList
        };
        const response = await api.post<any>('exam', url, payload);
        return response;
    } catch (error) {
        console.error('getPromotionReportSophia error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report',
            data: null
        };
    }
}
