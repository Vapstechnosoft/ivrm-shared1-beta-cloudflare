'use server';

import { api } from '@/lib/apiService';

export async function feeClassWiseDueListreportSophia(payload: any) {
    const url = '/FeeCollectionReport/FeesReportsSophia';
    return await api.post<any[]>('fees', url, payload);
}
