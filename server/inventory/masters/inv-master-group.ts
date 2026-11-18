'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function fetchInvMasterGroupData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterGroupFacade/loadMainGroup?${urlParams}`;
    return await api.get<any>('inventory', url, {});
}

export async function fetchMainGroupDropdownData() {
    const url = `/INV_MasterGroupFacade/loadMainGroupDropdown`;
    return await api.get<any>('inventory', url, {});
}

export async function saveInvMasterMainGroup(data: any) {
    const url = `/INV_MasterGroupFacade/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function saveInvMasterUserGroup(data: any) {
    const params = new URLSearchParams();
    const mapping: Record<string, string> = {
        invmG_Id: 'INVMG_Id',
        invmG_GroupName: 'INVMG_GroupName',
        invmG_AliasName: 'INVMG_AliasName',
        invmG_ParentId: 'INVMG_ParentId',
        invmG_ActiveFlg: 'INVMG_ActiveFlg'
    };

    for (const key in data) {
        const apiKey = mapping[key] || key;
        const val = data[key];
        if (val !== undefined && val !== null) {
            params.append(apiKey, val.toString());
        }
    }
    const url = `/INV_MasterGroupFacade/savedetailsUG?${params.toString()}`;
    return await api.post<any>('inventory', url, {});
}

export async function saveInvMasterItemGroup(data: any) {
    const params = new URLSearchParams();
    const mapping: Record<string, string> = {
        invmG_Id: 'INVMG_Id',
        invmG_GroupName: 'INVMG_GroupName',
        invmG_AliasName: 'INVMG_AliasName',
        invmG_ParentId: 'INVMG_ParentId',
        invmG_ActiveFlg: 'INVMG_ActiveFlg'
    };

    for (const key in data) {
        const apiKey = mapping[key] || key;
        const val = data[key];
        if (val !== undefined && val !== null) {
            params.append(apiKey, val.toString());
        }
    }
    params.append('INVMG_MGUGIGFlg', 'IG');
    const url = `/INV_MasterGroupFacade/savedetailsIG?${params.toString()}`;
    return await api.post<any>('inventory', url, {});
}

export async function deactivateInvMasterGroup(data: any) {
    const url = `/INV_MasterGroupFacade/deactive?id=${data.invmG_Id}`;
    return await api.post<any>('inventory', url, {});
}
