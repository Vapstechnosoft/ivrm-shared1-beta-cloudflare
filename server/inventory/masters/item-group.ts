'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function fetchItemGroupData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterGroupFacade/loadItemGroup?${urlParams}`;
    return await api.post<any>('inventory', url, {});
}

export async function fetchUserGroupDropdownData() {
    const url = `/INV_MasterGroupFacade/loadUserGroupDropdown`;
    return await api.post<any>('inventory', url, {});
}
