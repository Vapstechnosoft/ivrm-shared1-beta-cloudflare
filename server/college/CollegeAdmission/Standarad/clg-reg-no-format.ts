'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/CLGRegNoFormat';

export async function getClgRegNoFormatInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails`);
    } catch (error) {
        console.error('[Server] getClgRegNoFormatInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function saveClgRegNoFormat(data: any) {
    return await api.post<any>('college', `${BASE_URL}/savedetails`, data);
}
