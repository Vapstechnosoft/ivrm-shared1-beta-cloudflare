'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvMasterStore(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const storeListUrl = `/INV_MasterStoreFacade/GetStoreList?${urlParams}`;
    const employeeListUrl = `/INV_MasterStoreFacade/GetEmployeeList`;

    return await Promise.all([api.post<any>('inventory', storeListUrl, {}), api.post<any>('inventory', employeeListUrl, {})]).then(
        ([storeRes, empRes]) => ({
            success: true,
            data: {
                get_store: storeRes.data ?? storeRes,
                empname_list: empRes.data ?? empRes,
                total: storeRes.total ?? 0
            }
        })
    );
}

export async function saveInvMasterStore(data: any) {
    const params = new URLSearchParams();
    const contactNo = data.invmS_ContactNo || data.invmsT_ContactNo || data.INVMS_ContactNo || data.INVMST_ContactNo || '';
    const storeName = data.invmS_StoreName || data.invmsT_StoreName || data.INVMS_StoreName || data.INVMST_StoreName || '';
    const storeLocation =
        data.invmS_StoreLocation || data.invmsT_StoreLocation || data.INVMS_StoreLocation || data.INVMST_StoreLocation || '';
    const contactPerson =
        data.invmS_ContactPerson || data.invmsT_ContactPerson || data.INVMS_ContactPerson || data.INVMST_ContactPerson || '';
    const storeId = data.invmsT_Id || data.invmS_Id || data.INVMST_Id || data.INVMS_Id || 0;
    const hrmeId = data.hrmE_Id || data.HRME_Id || 0;
    const activeFlg =
        data.invmS_ActiveFlg !== undefined ? data.invmS_ActiveFlg : data.INVMST_ActiveFlg !== undefined ? data.INVMST_ActiveFlg : true;

    const payload: any = {
        INVMST_Id: storeId,
        INVMS_Id: storeId,
        INVMST_StoreName: storeName,
        INVMS_StoreName: storeName,
        INVMST_StoreLocation: storeLocation,
        INVMS_StoreLocation: storeLocation,
        INVMST_ContactPerson: contactPerson,
        INVMS_ContactPerson: contactPerson,
        INVMST_ContactNo: contactNo,
        INVMS_ContactNo: contactNo,
        HRME_Id: hrmeId,
        INVMST_ActiveFlg: activeFlg,
        INVMS_ActiveFlg: activeFlg
    };

    for (const key in payload) {
        const val = payload[key];
        if (val !== undefined && val !== null) {
            params.append(key, val.toString());
        }
    }

    const url = `/INV_MasterStoreFacade/savedetails?${params.toString()}`;
    return await api.post<any>('inventory', url, payload);
}

export async function deactivateInvMasterStore(data: any) {
    const id = data?.invmsT_Id ?? data?.invmS_Id ?? data?.INVMST_Id ?? data?.INVMS_Id ?? data?.id ?? data;
    const url = `/INV_MasterStoreFacade/deactive?id=${id}`;
    return await api.post<any>('inventory', url, {});
}
