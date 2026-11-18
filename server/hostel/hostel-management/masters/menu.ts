'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

// GET LIST
export async function getMessMenuList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    return await api.get<any>('hostel', `/MasterMessMenu/get_mess_menu_list?${urlParams}`);
}

// SAVE (ADD / UPDATE)
export async function saveMessMenu(data: any) {
    const url = `/MasterMessMenu/save_mess_menu`;

    const payload = {
        HLMMN_Id: data.hlmmN_Id ?? 0,
        HLMM_Id: data.hlmM_Id,
        HLMMC_Id: data.hlmmC_Id,
        HLMMN_MenuName: data.hlmmN_MenuName,
        HLMMN_MenuDesc: data.hlmmN_MenuDesc
    };

    return await api.post<any>('hostel', url, payload);
}

// ACTIVATE / DEACTIVATE
export async function toggleMessMenuStatus(id: number, activeFlag: boolean) {
    const url = `/MasterMessMenu/deactivate_mess_menu`;

    const payload = {
        HLMMN_Id: id,
        HLMMN_ActiveFlag: activeFlag
    };

    return await api.put<any>('hostel', url, payload);
}

export async function editMessMenu(data: any) {
    const url = `/MasterMessMenu/edit_mess_menu/${data.hlmmN_Id}`;
    return await api.get<any>('hostel', url);
}
