'use server';

import { api } from '@/lib/apiService';
import type { IMasterInstDocumentList } from '@/types/admission/AI/masterInstDocument';

export async function getMasterInstDocument(data: any = {}) {
    const url = '/AI/documents';
    // Using GET request with query params for filtering/pagination
    return await api.get<any>('admission', url, { params: data });
}

export async function addOrUpdateMasterInstDocument(data: any) {
    const url = '/AI/documents';
    return await api.post<any>('admission', url, data);
}

export async function toggleMasterInstDocument(id: number) {
    const url = `/AI/documents/toggle/${id}`;
    return await api.put<any>('admission', url, {});
}

export async function deleteMasterInstDocument(id: number) {
    const url = `/AI/documents/delete/${id}`;
    return await api.delete<any>('admission', url);
}

export async function getAIDashboardData(data: any) {
    const url = '/AI/dashboard'; 
    return await api.post<any>('admission', url, data);
}
