'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvItemStoreMappingLoadData(searchParams?: ApiSearchparams) {
    try {
        const urlParams = getSearchParamsUrl(searchParams ?? {});
        const url = `/INV_ItemStoreMapping/getloaddata?${urlParams}`;
        return await api.get<any>('inventory', url);
    } catch (error: any) {
        if (
            error?.status === 404 ||
            error?.response?.status === 404 ||
            error?.message?.includes('404') ||
            error?.message?.toLowerCase()?.includes('not found')
        ) {
            return {
                success: true,
                message: 'No records found',
                data: {
                    get_store: [],
                    get_item: [],
                    get_maingroup: [],
                    get_mapped_items: []
                }
            };
        }
        throw error;
    }
}

export async function saveInvItemStoreMapping(data: any) {
    const url = `/INV_ItemStoreMapping/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvItemStoreMapping(data: any) {
    const url = `/INV_ItemStoreMapping/deactive`;
    return await api.post<any>('inventory', url, data);
}
