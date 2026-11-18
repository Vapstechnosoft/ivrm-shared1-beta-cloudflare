'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';

export async function getMasterTimeSlab(searchParams?: ApiSearchparams) {
    const session = await auth();
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterTimeSlab/getdetails/0?${urlParams}`;
    const response = await api.get<any>('library', url);
    return response;
}

export async function getMasterTimeSlabList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterTimeSlab/get-master-timeslab-list?${urlParams}`;
    const response = await api.get<any>('library', url);
    return response;
}

export async function addOrUpdateMasterTimeSlab(data: any) {
    const session = await auth();
    const payload = {
        ...data,
        mI_Id: session?.mi_id
    };
    const url = '/MasterTimeSlab/save-class-timedata';
    return await api.post<any>('library', url, payload);
}

export async function deactivateMasterTimeSlab(id: number) {
    try {
        const session = await auth();
        const url = `/MasterTimeSlab/toggle-master-timeslab/${id}`;
        return await api.put<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to update status' };
    }
}
