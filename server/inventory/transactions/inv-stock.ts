'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvStockLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_StockFacade/GetStockLoadDataGrid?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function saveInvStock(data: any) {
    const url = `/INV_StockFacade/SaveStockDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvStockLoadStores() {
    const url = `/INV_T_SalesFacade/loadStores`;
    return await api.get<any>('inventory', url);
}

export async function getInvStockItems(storeId: number) {
    const url = `/INV_T_SalesFacade/getitem?INVMST_Id=${storeId}&INVC_LIFOFIFOFlg=LIFO`;
    return await api.get<any>('inventory', url);
}

export async function getInvMasterItemList() {
    const url = `/INV_MasterProductFacade/LoadItemList`;
    return await api.get<any>('inventory', url);
}

export async function getInvStockEditData(id: number) {
    const url = `/INV_StockFacade/EditStock?INVSTO_Id=${id}`;
    return await api.get<any>('inventory', url);
}
