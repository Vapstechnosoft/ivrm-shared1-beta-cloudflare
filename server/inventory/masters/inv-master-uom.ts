'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvMasterUOM(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterUOMFacade/getloaddata?${urlParams}`;
    return await api.post<any>('inventory', url, {});
}

export async function saveInvMasterUOM(data: any) {
    const params = new URLSearchParams();
    const mapping: Record<string, string> = {
        invmuoM_Id: 'INVMUOM_Id',
        invmuoM_UOMName: 'INVMUOM_UOMName',
        invmuoM_UOMAliasName: 'INVMUOM_UOMAliasName',
        invmuoM_Qty: 'INVMUOM_Qty',
        invmuoM_ActiveFlg: 'INVMUOM_ActiveFlg'
    };

    for (const key in data) {
        const apiKey = mapping[key] || key;
        const val = data[key];
        if (val !== undefined && val !== null) {
            params.append(apiKey, val.toString());
        }
    }

    const url = `/INV_MasterUOMFacade/savedetails?${params.toString()}`;
    return await api.post<any>('inventory', url, {});
}

export async function deactivateInvMasterUOM(data: any) {
    const url = `/INV_MasterUOMFacade/deactive?id=${data.invmuoM_Id}`;
    return await api.post<any>('inventory', url, {});
}
