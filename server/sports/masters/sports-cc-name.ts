'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { SportsCCNameEditDetailsDTO, SportsCCNameMasterDataDTO } from '@/types/sports/masters/sports-cc-name';
import { revalidatePath } from 'next/cache';

const BASE_URL = 'sports';

export async function getSportsCCNameDetails(searchParams?: ApiSearchparams) {
    const params = { ...searchParams };
    if (params.search_query) {
        params.search_query = String(params.search_query).trim();
        // If no columns selected, use default searchable columns
        if (!params.search_columns || params.search_columns === '') {
            params.search_columns =
                'groupName,SPCCMSCC_SportsCCName,SPCCMSCC_SportsCCDesc,SPCCMSCC_SGFlag,SPCCMSCC_NoOfMembers,SPCCMSCC_RecHighLowFlag';
        }
    }
    const urlParams = getSearchParamsUrl(params);
    const url = `/MasterSportsCCName/getDetails?${urlParams}`;
    return await api.post<SportsCCNameMasterDataDTO>(BASE_URL, url, {});
}

export async function saveSportsCCName(data: any) {
    const url = '/MasterSportsCCName/save';
    const res = await api.post<any>(BASE_URL, url, data);
    revalidatePath('/Sports/Masters/SportsCCName');
    return res;
}

export async function editSportsCCNameDetails(id: number) {
    const url = `/MasterSportsCCName/EditDetails/${id}`;
    return await api.post<SportsCCNameEditDetailsDTO>(BASE_URL, url, {});
}

export async function deactivateSportsCCName(data: { spccmscC_Id: number }) {
    const url = '/MasterSportsCCName/deactivate';
    const res = await api.post<any>(BASE_URL, url, data);
    revalidatePath('/Sports/Masters/SportsCCName');
    return res;
}
