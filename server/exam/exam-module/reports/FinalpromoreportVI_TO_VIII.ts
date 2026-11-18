'use server';

import { api } from '@/lib/apiService';

export async function getFinalpromoreportVI_TO_VIII(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    empsG_PercentValue: number;
    flag: string;
    emE_Id: number;
    reporttype: string;
    temp_AmstIds: { amsT_Id: number }[];
    empG_GroupName: string;
}) {
    try {
        const url = '/JSHSExamReports_/nds_6_8_report';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch (error) {
        console.error('getFinalpromoreportVI_TO_VIII error:', error);
        return {
            success: false,
            status: 500,
            message: 'Server error occurred while fetching report'
        };
    }
}
