'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

/**
 * Fetch User Group Grid Data
 */
export async function fetchUserGroupGridData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterGroupFacade/loadUserGroupGRID?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function fetchMainGroupDropdownData() {
    const url = `/INV_MasterGroupFacade/loadMainGroupDropdown`;
    return await api.get<any>('inventory', url);
}

export async function saveMasterUserGroup(data: any) {
    const url = `/INV_MasterGroupFacade/savedetails`;
    return await api.post<any>('inventory', url, { data });
}
