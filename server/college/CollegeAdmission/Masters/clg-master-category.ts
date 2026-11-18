'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/ClgMasterCategory';

export async function getClgMasterCategoryInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails?pageid=2`);
    } catch (error) {
        console.error('[Server] getClgMasterCategoryInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function saveClgMasterCategory(data: any) {
    return await api.post<any>('college', `${BASE_URL}/Savedetails`, data);
}

export async function deactivateClgMasterCategory(data: any) {
    return await api.post<any>('college', `${BASE_URL}/deactivate`, data);
}
