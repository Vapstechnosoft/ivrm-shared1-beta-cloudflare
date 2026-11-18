'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvMasterProductLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'invmP_ProductName,invmP_ProductCode,invmP_ProductPrice,invmP_Id,invmP_ActiveFlg'
    );
    const url = `/INV_MasterProductFacade/GetProductList?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function getInvMasterProductList() {
    const url = `/INV_MasterProductFacade/LoadProductList`;
    return await api.get<any>('inventory', url);
}

export async function getInvMasterItemList() {
    const url = `/INV_MasterProductFacade/LoadItemList`;
    return await api.get<any>('inventory', url);
}

export async function getInvMasterProductItemList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'invmP_ProductName,invmI_ItemName,invmpI_ItemQty,invmpI_Id,invmpI_ActiveFlg'
    );
    const url = `/INV_MasterProductFacade/GetProductItemList?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function saveInvMasterProduct(data: any) {
    const url = `/INV_MasterProductFacade/SaveProductDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function saveInvMasterProductQty(data: any) {
    const url = `/INV_MasterProductFacade/SaveProductItemQtyDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactiveInvMasterProduct(data: any) {
    const url = `/INV_MasterProductFacade/deactive`;
    return await api.post<any>('inventory', url, data);
}

export async function deactiveInvMasterProductQty(data: any) {
    const url = `/INV_MasterProductFacade/deactiveQty`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvMasterProductTax(id: number) {
    const url = `/INV_MasterProductFacade/productTax?INVMP_Id=${id}`;
    return await api.get<any>('inventory', url);
}

export async function deactiveInvMasterProductTax(data: any) {
    const url = `/INV_MasterProductFacade/deactiveptax`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvMasterTaxList() {
    const url = `/INV_MasterItemFacade/get_taxlist`;
    return await api.post<any>('inventory', url, {});
}
