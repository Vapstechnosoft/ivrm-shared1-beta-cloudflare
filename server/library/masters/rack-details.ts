'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type { IMasterRackDetails } from '@/types/library/masters/rack-details';

export async function getMasterRackDetails(searchParams?: ApiSearchparams) {
    try {
        const session = await auth();
        const urlParams = getSearchParamsUrl({ ...searchParams, mI_Id: session?.mi_id }, 'lmrA_RackName');
        const url = `/RackDetails/get-master-rack-list?${urlParams}`;
        const response = await api.get<IMasterRackDetails[]>('library', url);
        return response;
    } catch (error) {
        console.error('getMasterRackDetails error:', error);
        return [] as IMasterRackDetails[];
    }
}

export async function addOrUpdateMasterRack(data: any) {
    try {
        const session = await auth();
        const payload = {
            LMRA_Id: data.lmrA_Id || 0,
            LMRA_RackName: data.lmrA_RackName,
            LMRA_DisplayColour: data.lmrA_DisplayColour,
            LMRA_FloorName: data.lmrA_FloorName,
            LMRA_Location: data.lmrA_Location,
            LMRA_BuildingName: data.lmrA_BuildingName,
            LMS_Id: data.lmS_Id,
            MI_Id: session?.mi_id
        };
        const url = '/RackDetails/save-rack-details';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to save record' };
    }
}

export async function toggleMasterRack(id: number) {
    try {
        const url = `/RackDetails/deactivate-rack/${id}`;
        return await api.put<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to toggle record' };
    }
}
