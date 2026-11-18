'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterParticulars } from '@/types/pettycash/master/masters';

export async function getMasterParticularsGrid(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'pcmparT_ParticularName,pcmparT_ParticularDesc');
    const url = `/PC_Master_ParticularsFacade/MasterParticularsGrid?${urlParams}`;
    console.info('Fetching Master Particulars with URL:', url);
    return await api.get<IMasterParticulars[]>('pettycashandassettracking', url);
}

export async function addOrUpdateMasterParticulars(data: any) {
    const url = '/PC_Master_ParticularsFacade/saverecord';
    // /PC_Master_ParticularsFacade/saverecord
    return await api.post<any>('pettycashandassettracking', url, data);
}

export async function toggleMasterParticulars(id: number) {
    const url = `/PC_Master_ParticularsFacade/deactiveY/${id}`;
    return await api.put('pettycashandassettracking', url);
}
