'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterLanguageList } from '@/types/library/masters/masters';

export async function getMasterLanguageList(searchParams?: ApiSearchparams) {
    try {
        const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lmL_LanguageName');
        const url = `/MasterLanguage/master-language-list?${urlParams}`;
        return await api.get<IMasterLanguageList[]>('library', url);
    } catch (error) {
        console.error('getMasterLanguageList error:', error);
        return [] as IMasterLanguageList[];
    }
}

export async function addOrUpdateMasterLanguage(data: any) {
    try {
        const url = '/MasterLanguage/add-or-update/';
        return await api.post<any>('library', url, data);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to save record' };
    }
}

export async function toggleMasterLanguage(id: number) {
    try {
        const url = `/MasterLanguage/toggle?LML_Id=${id}`;
        return await api.put('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to toggle record' };
    }
}

export async function deleteMasterLanguage(id: number) {
    try {
        const url = `/MasterLanguage/delete/${id}`;
        return await api.delete('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to delete record' };
    }
}
