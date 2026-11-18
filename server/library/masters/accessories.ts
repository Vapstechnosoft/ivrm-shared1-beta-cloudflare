'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getMasterAccessories(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterAccessoriesFacade/get-master-acessories-list?${urlParams}`;
    const response = await api.get<any[]>('library', url);
    return response;
}

export async function addOrUpdateMasterAccessories(data: any) {
    try {
        const now = new Date().toISOString();
        const payload = {
            createdDate: data.createdDate || now,
            updatedDate: data.updatedDate || now,
            lmaC_Id: Number(data.lmaC_Id ?? 0),
            lmaC_AccessoriesName: data.lmaC_AccessoriesName ?? '',
            lmaC_AccessoriesDesc: data.lmaC_AccessoriesDesc ?? ''
        };
        const url = '/MasterAccessoriesFacade/add-or-update';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to save accessory' };
    }
}

export async function deactivateMasterAccessories(data: any) {
    try {
        const id = typeof data === 'object' ? data.lmaC_Id : data;
        const url = `/MasterAccessoriesFacade/toggle-master-accessories/${id}`;
        return await api.put<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to toggle record' };
    }
}
