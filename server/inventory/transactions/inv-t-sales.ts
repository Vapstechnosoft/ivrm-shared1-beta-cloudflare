'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvTSalesLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'invmsL_Id,invmsL_SalesNo,invmsL_StuOtherFlg,invmsL_SalesDate,invmsL_SalesValue,invmsL_TotDiscount,invmsL_TotTaxAmt,invmsL_TotalAmount,invmsL_ActiveFlg'
    );
    const url = `/INV_T_SalesFacade/loadSales?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function saveInvTSalesDetails(data: any) {
    const url = `/INV_T_SalesFacade/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function toggleInvTSalesActive(data: any) {
    const url = `/INV_T_SalesFacade/deactiveS?id=${data.invmsL_Id}`;
    return await api.post<any>('inventory', url, {});
}

export async function getInvTSalesItemDetails(invmsL_Id: number, saletype: string) {
    const url = `/INV_T_SalesFacade/getSaleItemDetails?INVMSL_Id=${invmsL_Id}&saletype=${saletype}`;
    return await api.get<any>('inventory', url);
}

export async function getStudentClsSec(type: string) {
    const url = `/INV_T_SalesFacade/getStudentClsSec?type=${type}`;
    return await api.get<any>('inventory', url);
}

export async function getStudentList(data: any) {
    const params = new URLSearchParams();
    if (data.ASMCL_Id) params.append('ASMCL_Id', data.ASMCL_Id.toString());
    if (data.ASMS_Id) params.append('ASMS_Id', data.ASMS_Id.toString());
    if (data.type) params.append('type', data.type);
    const url = `/INV_T_SalesFacade/getStudentlist?${params.toString()}`;
    return await api.get<any>('inventory', url);
}

export async function getSectionList(classId: number) {
    const url = `/INV_T_SalesFacade/getsectionlist?ASMCL_Id=${classId}`;
    return await api.get<any>('inventory', url);
}

export async function getItemOnStoreChange(data: any) {
    const params = new URLSearchParams();
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
            params.append(key, data[key].toString());
        }
    }
    const url = `/INV_T_SalesFacade/getitem?${params.toString()}`;
    return await api.get<any>('inventory', url);
}

export async function getItemDetail(data: any) {
    const params = new URLSearchParams();
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
            params.append(key, data[key].toString());
        }
    }
    const url = `/INV_T_SalesFacade/getitemDetail?${params.toString()}`;
    return await api.get<any>('inventory', url);
}

export async function getInvTSalesEmployees() {
    const url = `/INV_T_SalesFacade/loadEmployees`;
    return await api.get<any>('inventory', url);
}

export async function getInvTSalesCustomers() {
    const url = `/INV_T_SalesFacade/loadCustomers`;
    return await api.get<any>('inventory', url);
}

export async function getInvTSalesStores() {
    const url = `/INV_T_SalesFacade/loadStores`;
    return await api.get<any>('inventory', url);
}

export async function getSaleItemDetails(invmsL_Id: number) {
    const url = `/INV_T_SalesFacade/getSaleItemDetails?INVMSL_Id=${invmsL_Id}`;
    return await api.get<any>('inventory', url);
}

export async function getSaletypes(invmsL_Id: number, saletype: string) {
    const url = `/INV_T_SalesFacade/getSaletypes?INVMSL_Id=${invmsL_Id}&saletype=${saletype}`;
    return await api.get<any>('inventory', url);
}

export async function deleteInvTSales(data: any) {
    const url = `/INV_T_SalesFacade/deactiveS?id=${data.invmsL_Id}`;
    return await api.post<any>('inventory', url, {});
}
