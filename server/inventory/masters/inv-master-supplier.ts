'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvMasterSupplier(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterSupplierFacade/getloaddata?${urlParams}`;
    try {
        const res = await api.post<any>('inventory', url, {});
        const data = res?.data ?? res?.get_supplier ?? (Array.isArray(res) ? res : []);
        const message = res?.message || '';
        const isNoRecords =
            res?.success === false &&
            (typeof message === 'string' &&
                (message.toLowerCase().includes('no ') ||
                    message.toLowerCase().includes('not found') ||
                    message.toLowerCase().includes('no record') ||
                    message.toLowerCase().includes('empty')));

        if (isNoRecords) {
            return {
                ...res,
                success: true,
                data: [],
                total: 0
            };
        }

        return {
            ...res,
            data: Array.isArray(data) ? data : [],
            total: res?.total ?? (Array.isArray(data) ? data.length : 0)
        };
    } catch (error: any) {
        const msg = (typeof error === 'string' ? error : error?.message || '').toLowerCase();
        if (msg.includes('no ') || msg.includes('not found') || msg.includes('no record') || msg.includes('empty')) {
            return {
                success: true,
                data: [],
                total: 0
            };
        }
        throw error;
    }
}

export async function saveInvMasterSupplier(data: any) {
    const params = new URLSearchParams();
    const mapping: Record<string, string> = {
        invmS_Id: 'INVMS_Id',
        invmS_SupplierName: 'INVMS_SupplierName',
        invmS_SupplierCode: 'INVMS_SupplierCode',
        invmS_SupplierConatctPerson: 'INVMS_SupplierConatctPerson',
        invmS_SupplierConatctNo: 'INVMS_SupplierConatctNo',
        invmS_EmailId: 'INVMS_EmailId',
        invmS_GSTNo: 'INVMS_GSTNo',
        invmS_SupplierAddress: 'INVMS_SupplierAddress',
        invmS_ActiveFlg: 'INVMST_ActiveFlg'
    };

    for (const key in data) {
        const apiKey = mapping[key] || key;
        const val = data[key];
        if (val !== undefined && val !== null) {
            params.append(apiKey, val.toString());
        }
    }
    const url = `/INV_MasterSupplierFacade/savedetails?${params.toString()}`;
    return await api.post<any>('inventory', url, {});
}

export async function deactivateInvMasterSupplier(data: any) {
    const url = `/INV_MasterSupplierFacade/deactive?id=${data.invmS_Id}`;
    return await api.post<any>('inventory', url, {});
}
