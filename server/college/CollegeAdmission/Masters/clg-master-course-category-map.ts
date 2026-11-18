'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/ClgMasterCourseCategoryMap';

export async function getCourseCategoryMapInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/get_alldetails`);
    } catch (error) {
        console.error('[Server] getCourseCategoryMapInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function saveCourseCategoryMap(data: any) {
    return await api.post<any>('college', `${BASE_URL}/Savedetails`, data);
}

export async function deactivateCourseCategoryMap(amcocmId: number) {
    return await api.post<any>('college', `${BASE_URL}/deactive?AMCOCM_Id=${amcocmId}`);
}
