'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvTItemConsumptionLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_ItemConsumptionFacade/GetItemConsumption?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function saveInvTItemConsumption(data: any) {
    const url = `/INV_ItemConsumptionFacade/SaveItemConsumptionDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactiveInvTItemConsumption(data: any) {
    const url = `/INV_ItemConsumptionFacade/deactive?INVMIC_Id=${data.invmiC_Id}&INVMIC_StuOtherFlg=${data.invmiC_StuOtherFlg}`;
    return await api.post<any>('inventory', url, {});
}

export async function getItemConsumptionDetails(data: any) {
    const url = `/INV_ItemConsumption/getICDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function getItemsOnStoreChange(data: { INVMST_Id: number; INVC_LIFOFIFOFlg?: string }) {
    const flag = data.INVC_LIFOFIFOFlg || 'LIFO';
    const url = `/INV_T_SalesFacade/getitem?INVMST_Id=${data.INVMST_Id}&INVC_LIFOFIFOFlg=${flag}`;
    return await api.get<any>('inventory', url);
}

export async function getItemStockDetails(data: any) {
    const params = new URLSearchParams();
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
            params.append(key, data[key].toString());
        }
    }
    const url = `/INV_T_SalesFacade/getitemDetail?${params.toString()}`;
    return await api.get<any>('inventory', url);
}

export async function getInvTItemConsumptionStores() {
    return await api.get<any>('inventory', `/INV_T_GRNFacade/loadstores`);
}

export async function getInvTItemConsumptionDepartments() {
    return await api.get<any>('inventory', '/INV_ItemConsumptionFacade/GetDepartment');
}

export async function getInvTItemConsumptionProducts() {
    return await api.get<any>('inventory', '/INV_ItemConsumptionFacade/GetProducts');
}

export async function getInvTItemConsumptionEmployees() {
    return await api.get<any>('inventory', `/INV_T_SalesFacade/loadEmployees`);
}

export async function getStudentClsSec(type: string) {
    return await api.get<any>('inventory', `/INV_T_SalesFacade/getStudentClsSec?type=${type}`);
}

export async function getStudentList(data: any) {
    const params = new URLSearchParams();
    if (data.ASMCL_Id) params.append('ASMCL_Id', data.ASMCL_Id.toString());
    if (data.ASMS_Id) params.append('ASMS_Id', data.ASMS_Id.toString());
    if (data.type) params.append('type', data.type);
    return await api.get<any>('inventory', `/INV_T_SalesFacade/getStudentlist?${params.toString()}`);
}

export async function getSectionList(classId: number) {
    return await api.get<any>('inventory', `/INV_T_SalesFacade/getsectionlist?ASMCL_Id=${classId}`);
}

export async function getICUserDetails(INVMIC_Id: number, userflag: string) {
    return await api.get<any>('inventory', `/INV_ItemConsumptionFacade/getICUserDetails?INVMIC_Id=${INVMIC_Id}&userflag=${userflag}`);
}

export async function getICItemDetails(INVMIC_Id: number) {
    return await api.get<any>('inventory', `/INV_ItemConsumptionFacade/getICItemDetails?INVMIC_Id=${INVMIC_Id}`);
}
