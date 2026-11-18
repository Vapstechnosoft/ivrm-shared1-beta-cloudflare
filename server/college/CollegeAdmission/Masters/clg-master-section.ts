'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/CollegeMasterSection';

export async function getSections() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails`);
    } catch (error) {
        console.error('[Server] getSections error:', error);
        return { success: false, message: 'Failed to fetch sections' } as any;
    }
}

export async function saveSection(data: any) {
    return await api.post<any>('college', `${BASE_URL}/saveMasterdata`, data);
}

export async function editSection(id: number) {
    return await api.post<any>('college', `${BASE_URL}/Editdetails?ACMS_Id=${id}`);
}

export async function toggleSection(id: number) {
    return await api.post<any>('college', `${BASE_URL}/Deletedetails?ACMS_Id=${id}`);
}

export async function saveSectionOrder(data: any) {
    return await api.post<any>('college', `${BASE_URL}/saveorder`, data);
}
