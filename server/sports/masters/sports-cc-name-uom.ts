'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSportsCCNameUOMResponse } from '@/types/sports/masters/sports-cc-name-uom';
import { revalidatePath } from 'next/cache';

const BASE_URL = 'sports';

export async function getMasterSportsCCNameUOMs(searchParams?: ApiSearchparams) {
    const params = { ...searchParams };
    if (params.search_query) {
        params.search_query = String(params.search_query).trim();
        // If no columns selected, use default searchable columns from DTO
        if (!params.search_columns || params.search_columns === '') {
            params.search_columns = 'sportsCCName,uomName';
        }
    }
    const urlParams = getSearchParamsUrl(params);
    const url = `/MasterSportsCCNameUOM_/getDetails?${urlParams}`;
    return await api.post<IMasterSportsCCNameUOMResponse>(BASE_URL, url, {});
}

export async function saveMasterSportsCCNameUOM(data: any) {
    const url = `/MasterSportsCCNameUOM_/save`;
    const res = await api.post<any>(BASE_URL, url, data);
    revalidatePath('/Sports/Masters/SportsCCNameUOM');
    return res;
}

export async function editMasterSportsCCNameUOM(id: number) {
    const url = `/MasterSportsCCNameUOM_/EditDetails/${id}`;
    return await api.post<any>(BASE_URL, url, {});
}

export async function deactivateMasterSportsCCNameUOM(data: any) {
    const url = `/MasterSportsCCNameUOM_/deactivate`;
    const res = await api.post<any>(BASE_URL, url, data);
    revalidatePath('/Sports/Masters/SportsCCNameUOM');
    return res;
}
