'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getMasterCategoryList(searchParams?: ApiSearchparams) {
    try {
        const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lmC_CategoryName,lmC_CategoryCode');
        const url = `/MasterCategory/master-books-category-list?${urlParams}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch categories', data: [] };
    }
}

export async function addOrUpdateMasterCategory(data: any) {
    try {
        const url = '/MasterCategory/add-or-update/';
        return await api.post<any>('library', url, data);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to save category' };
    }
}

export async function toggleMasterCategory(id: number) {
    try {
        const url = `/MasterCategory/toggle/${id}`;
        return await api.put('library', url, {});
    } catch (error: any) {
        return { success: false, message: error?.message || error?.toString() || 'Failed to toggle category' };
    }
}

export async function deleteMasterCategory(id: number) {
    try {
        const url = `/MasterCategory/delete?id=${id}`;
        return await api.delete('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete category' };
    }
}
