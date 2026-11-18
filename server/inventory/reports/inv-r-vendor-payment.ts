'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvVendorPaymentReport(payload: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_VendorPayment_ReportFacade/onreport?${urlParams}`;
    console.log('getInvVendorPaymentReport Payload:', payload);
    return await api.post<any>('inventory', url, payload);
}

export async function getInvVendorDetails(payload: any) {
    const url = `/INV_VendorPayment_ReportFacade/getvendordetail`;
    console.log('getInvVendorDetails Payload:', payload);
    return await api.post<any>('inventory', url, payload);
}
