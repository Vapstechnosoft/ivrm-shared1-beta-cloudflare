'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvMasterTax(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'invmT_TaxName,invmT_TaxAliasName');
    const url = `/INV_MasterTaxFacade/loadtaxlist?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function getInvMasterTaxDetails(id: number) {
    const url = `/INV_MasterTaxFacade/getdetails`;
    return await api.post<any>('inventory', url, { INVMT_Id: id });
}

export async function getLedgerUnder(famled_id: number) {
    const url = `/INV_MasterTaxFacade/getledgerunder`;
    return await api.post<any>('inventory', url, { FAMLED_Id: famled_id });
}

export async function saveInvMasterTax(data: any) {
    const params = new URLSearchParams();
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
            params.append(key, data[key].toString());
        }
    }
    const url = `/INV_MasterTaxFacade/savedetails?${params.toString()}`;
    return await api.post<any>('inventory', url, {});
}

export async function saveInvMasterTaxLedger(data: any) {
    const url = `/INV_MasterTaxFacade/saveledger`;
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvMasterTax(data: any) {
    const id = data?.invmT_Id ?? data?.INVMT_Id ?? data?.id ?? data;
    const url = `/INV_MasterTaxFacade/deactive?id=${id}`;
    return await api.post<any>('inventory', url, {});
}
