'use server';

import { api } from '@/lib/apiService';

export async function getNDS9ProgressCardReport(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    temp_AmstIds: { amsT_Id: number }[];
}) {
    try {
        const response = await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', data);
        console.log('API RESPONSE [nds_6_8_report]:', JSON.stringify(response).substring(0, 1000));
        return response;
    } catch (error) {
        console.error('getNDS9ProgressCardReport error:', error);
        return { success: false, status: 500, message: 'Server error occurred' };
    }
}
