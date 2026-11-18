'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGroupList } from '@/types/fees/masters/masters';

export async function getMasterGroup(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'fmG_GroupName,fmG_Remarks,fmG_CompulsoryFlag');
    const url = `/fee_group/getdata?${urlParams}`;
    return await api.get<IMasterGroupList[]>('fees', url);
}

export async function addOrUpdateMasterGroup(data: any) {
    const payload = {
        ...data,
        fmG_PRE_FLAG: data.fmG_PRE_FLAG || '0'
        // mI_Id: data.mI_Id || (session?.mi_id ? Number(session.mi_id) : undefined),
        // user_id: data.user_id || (session?.user_id ? Number(session.user_id) : undefined)
    };
    const url = '/fee_group/fee_group_savedetails';
    return await api.post<any>('fees', url, payload);
}

export async function toggleMasterGroup(id: number) {
    const url = `/fee_group/toggle_master_feegroup/${id}`;
    return await api.put('fees', url);
}
