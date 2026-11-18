'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeBankDetailsList } from '@/types/fees/masters/masters';

export async function getFeeBankDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'fmbanK_BankName,fmbanK_BankDescription');
    const url = `FeeheadWiseReportFacade/getBankdata?${urlParams}`;
    return await api.get<IFeeBankDetailsList[]>('fees', url);
}

export async function addOrUpdateFeeBankDetails(data: any) {
    const url = 'FeeheadWiseReportFacade/BankdataSave';
    return await api.post<any>('fees', url, data);
}

export async function toggleFeeBankDetails(id: number) {
    const url = `FeeheadWiseReportFacade/BankDataDecative/${id}`;
    return await api.put('fees', url);
}
