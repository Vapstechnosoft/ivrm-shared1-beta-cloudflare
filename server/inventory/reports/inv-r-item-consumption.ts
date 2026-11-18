'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvRItemConsumptionLoadData(optionflag: string) {
    const url = `/INV_ItemConsumptionReportFacade/getloaddata?optionflag=${optionflag}`;
    return await api.get<any>('inventory', url);
}

export async function getInvRItemConsumptionReport(payload: any, searchParams?: ApiSearchparams) {
    console.log(payload, '------------------------------->');
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_ItemConsumptionReportFacade/onreport?${urlParams}`;
    return await api.post<any>('inventory', url, payload);
}
