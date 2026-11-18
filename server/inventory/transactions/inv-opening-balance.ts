'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvOpeningBalanceLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_OpeningBalanceFacade/GetOpeningBalance?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function saveInvOpeningBalance(data: any) {
    const url = `/INV_OpeningBalanceFacade/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactiveInvOpeningBalance(data: any) {
    const url = `/INV_OpeningBalanceFacade/deactive`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvOpeningBalanceStores() {
    const url = `/INV_T_SalesFacade/loadStores`;
    return await api.get<any>('inventory', url);
}

export async function getInvOpeningBalanceItems(data: { INVMST_Id: number; INVC_LIFOFIFOFlg?: string }) {
    const flag = data.INVC_LIFOFIFOFlg || 'LIFO';
    const url = `/INV_T_SalesFacade/getitem?INVMST_Id=${data.INVMST_Id}&INVC_LIFOFIFOFlg=${flag}`;
    return await api.get<any>('inventory', url);
}

export async function getSelectionItemDetails(data: { INVMI_Id: number }) {
    const url = `/INV_T_GRNFacade/getItemDetail?id=${data.INVMI_Id}`;
    return await api.get<any>('inventory', url);
}

export async function getOpeningBalanceDetails(data: { INVOB_Id: number }) {
    const url = `/INV_OpeningBalanceFacade/getobdetails?INVOB_Id=${data.INVOB_Id}`;
    return await api.get<any>('inventory', url);
}
