'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvRSalesLoadData() {
    return await api.get<any>('inventory', '/INV_R_SalesFacade/getloaddata');
}

export async function getInvRSalesItemLoadData(optionflag: string) {
    const url = `/INV_R_GRNFacade/getloaddata?flg=${optionflag}`;
    return await api.get<any>('inventory', url, {});
}

export async function getInvRSalesStaffLoadData() {
    const url = `/INV_ItemConsumptionReportFacade/getloaddata?optionflag=Staff`;
    return await api.get<any>('inventory', url);
}

export async function getInvRSalesDetails(optionflag: string, typeflag = '') {
    const url = `/INV_R_SalesFacade/mainradiochange?type=${optionflag}&typeflag=${typeflag || optionflag}`;
    return await api.get<any>('inventory', url);
}

export async function getInvRSalesClassData(type: string) {
    return await api.post<any>('inventory', '/INV_R_SalesFacade/radiochange', { type });
}

export async function getInvRSalesStudentList(payload: any) {
    const url = `/INV_R_SalesFacade/getStudentlist`;
    console.log('getInvRSalesStudentList Payload:', payload);
    return await api.post<any>('inventory', url, payload);
}

export async function getInvRSalesReport(payload: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_R_SalesFacade/onreport?${urlParams}`;
    console.log('getInvRSalesReport Payload:', payload);
    return await api.post<any>('inventory', url, payload);
}
