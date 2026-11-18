'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvRGRNLoadData(optionflag: string) {
    const url = `/INV_R_GRNFacade/getloaddata?flg=${optionflag}`;
    return await api.get<any>('inventory', url, {});
}

export async function getInvRGRNReport(payload: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_R_GRNFacade/onreport?${urlParams}`;
    console.log('getInvRGRNReport Payload:', payload);
    return await api.post<any>('inventory', url, payload);
}
