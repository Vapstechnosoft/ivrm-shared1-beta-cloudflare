'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type { IMasterVendorList } from '@/types/library/masters/masters';

export async function getMasterVendorList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lmV_VendorName,lmV_EMailId,lmV_MobileNo,lmV_Address');
    const url = `/MasterVendor/get-master-vendor-list?${urlParams}`;
    return await api.get<IMasterVendorList[]>('library', url);
}

export async function addOrUpdateMasterVendor(data: any) {
    try {
        const session = await auth();
        const payload = {
            lmV_Id: data.lmV_Id || data.LMV_Id || 0,
            mI_Id: data.mI_Id || 0,
            lmV_VendorName: data.lmV_VendorName || data.LMV_VendorName || '',
            lmV_Address: data.lmV_Address || data.LMV_Address || '',
            lmV_EMailId: data.lmV_EMailId || data.LMV_EMailId || '',
            lmV_PhoneNo: data.lmV_PhoneNo || data.LMV_PhoneNo || '',
            lmV_MobileNo: data.lmV_MobileNo || data.LMV_MobileNo || 0,
            lmV_ActiveFlg: data.lmV_ActiveFlg !== undefined ? data.lmV_ActiveFlg : true
        };
        const url = '/MasterVendor/add-or-update';
        return await api.post<any>('library', url, payload);
    } catch (error: any) {
        return { success: false, message: error?.message || 'An error occurred during save' };
    }
}

export async function toggleMasterVendor(id: number) {
    try {
        const url = `/MasterVendor/toggle?LMV_Id=${id}`;
        return await api.put('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'An error occurred during toggle' };
    }
}

export async function deleteMasterVendor(id: number) {
    try {
        const url = `/MasterVendor/delete/${id}`;
        return await api.delete('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'An error occurred during delete' };
    }
}
