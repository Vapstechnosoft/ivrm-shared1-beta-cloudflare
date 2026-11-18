'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/CLGMasterSemister';

export async function getSemesters() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getdata`);
    } catch (error) {
        console.error('[Server] getSemesters error:', error);
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

export async function saveSemester(data: any) {
    return await api.post<any>('college', `${BASE_URL}/savesem`, data);
}

export async function editSemester(id: number) {
    return await api.post<any>('college', `${BASE_URL}/editsem?AMSE_Id=${id}`);
}

export async function toggleSemester(id: number) {
    return await api.post<any>('college', `${BASE_URL}/activedeactivesem?AMSE_Id=${id}`);
}

export async function saveSemesterOrder(data: any) {
    return await api.post<any>('college', `${BASE_URL}/getOrder`, data);
}
