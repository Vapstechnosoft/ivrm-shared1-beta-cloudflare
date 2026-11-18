'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

const API_BASE_URL = '/HostelAllotForGuest';

// LOAD DATA
export async function getGuestAllotmentLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    return await api.get<any>('hostel', `${API_BASE_URL}/load_grid_data?${urlParams}`);
}

// GET ROOM DETAILS
export async function getRoomDetails(data: { HRMRM_Id: number }) {
    return await api.get<any>('hostel', `${API_BASE_URL}/get_roomdetails/${data.HRMRM_Id}`);
}

// SAVE (ADD / UPDATE)
export async function saveGuestAllotment(data: any) {
    const payload = {
        ...data,
        HLHGSTALT_AllotmentDate: data.HLHGSTALT_AllotmentDate
    };

    return await api.post<any>('hostel', `${API_BASE_URL}/save_or_update`, payload);
}

export async function getEditData(hlhgstalT_Id: number) {
    return await api.get<any>('hostel', `${API_BASE_URL}/edit_data/${hlhgstalT_Id}`);
}

export async function toggleGuestAllotment(HLHGSTALT_Id: number) {
    return await api.put<any>('hostel', `${API_BASE_URL}/activate_deactivate/${HLHGSTALT_Id}`);
}
