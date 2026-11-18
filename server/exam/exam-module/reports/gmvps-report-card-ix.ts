'use server';

import { api } from '@/lib/apiService';

export async function getGmvpsProgressCardIXReport(payload: any) {
    return await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
}
