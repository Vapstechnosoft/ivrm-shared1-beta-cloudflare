'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterPublisherList } from '@/types/library/masters/masters';

export async function getMasterPublisherList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lmP_PublisherName');
    const url = `/MasterPublisher/master-publisher-list?${urlParams}`;
    return await api.get<IMasterPublisherList[]>('library', url);
}

export async function addOrUpdateMasterPublisher(data: any) {
    const url = '/MasterPublisher/add-or-update/';
    return await api.post<any>('library', url, data);
}

export async function toggleMasterPublisher(id: number) {
    try {
        const url = `/MasterPublisher/toggle/${id}`;
        return await api.put<any>('library', url, {});
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to toggle record' };
    }
}

export async function deleteMasterPublisher(id: number) {
    const url = `/MasterPublisher/delete/${id}`;
    return await api.delete('library', url);
}
