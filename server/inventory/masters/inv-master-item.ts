'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvMasterItem(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterItemFacade/getloaddata?${urlParams}`;
    return await api.get<any>('inventory', url, {});
}

export async function getItemTax(itemId: number) {
    const url = `/INV_MasterItemFacade/get_itemTax?id=${itemId}`;
    return await api.post<any>('inventory', url, {});
}

export async function saveInvMasterItem(data: any) {
    const url = `/INV_MasterItemFacade/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvMasterItem(data: any) {
    const id = data?.invmI_Id ?? data?.INVMI_Id ?? data?.id ?? data;
    const url = `/INV_MasterItemFacade/deactive?id=${id}`;
    return await api.post<any>('inventory', url, {});
}

export async function deactivateItemTax(tax: any) {
    const id = tax?.invmiT_Id ?? tax?.INVMIT_Id ?? tax?.id ?? tax;
    const url = `/INV_MasterItemFacade/deactiveitax?id=${id}`;
    return await api.post<any>('inventory', url, {});
}

export async function getUOMDropdown() {
    const url = `/INV_MasterItemFacade/get_uomdropdown`;
    return await api.post<any>('inventory', url, {});
}

export async function getTaxList() {
    const url = `/INV_MasterItemFacade/get_taxlist`;
    return await api.post<any>('inventory', url, {});
}
