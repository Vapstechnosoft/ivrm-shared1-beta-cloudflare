'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IPDAMasterHead, IPDAMasterHeadResponse } from '@/types/pda/master/master-head';

export async function getPDAMasterHeadDetails(searchParams?: ApiSearchparams) {
    const url = '/PDAMasterHeadFacade/getpagedetails';
    return await api.get<IPDAMasterHeadResponse>('pettycashandassettracking', url);
}

export async function getPDAFeeHeadsDropdown() {
    const url = '/PDAMasterHeadFacade/getdetails';
    return await api.get<any>('pettycashandassettracking', url);
}

export async function savePDAMasterHead(data: any) {
    const url = '/PDAMasterHeadFacade/savedetails';
    return await api.post<IPDAMasterHeadResponse>('pettycashandassettracking', url, data);
}

export async function togglePDAMasterHead(data: IPDAMasterHead) {
    // Use PUT as specified by the user
    const url = `/PDAMasterHeadFacade/MasterHeadToggle/${data.pdamH_Id}`;
    return await api.put<IPDAMasterHeadResponse>('pettycashandassettracking', url, data);
}
