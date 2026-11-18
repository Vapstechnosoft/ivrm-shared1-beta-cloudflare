'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/DocumentViewClg';

export async function getRegisterReportClg(data: any) {
    return await api.post<any>('college', `${BASE_URL}/Getregdata`, data);
}

export async function getRegisterReportClgYearList() {
    try {
        return await api.get<any>('college', `${BASE_URL}/Getyearlist`);
    } catch (error) {
        console.error('[Server] getRegisterReportClgYearList error:', error);
        return { success: false, message: 'Failed to fetch year list' } as any;
    }
}
