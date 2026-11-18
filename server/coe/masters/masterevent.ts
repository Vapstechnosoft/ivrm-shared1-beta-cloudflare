'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { MasterEventCoe } from '@/types/coe/masterevent';

export async function getMasterEventCoe(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'coemE_EventName,coemE_EventDesc');
    const url = `/master_coe/event_details_grid?${urlParams}`;
    return await api.get<MasterEventCoe[]>('coe', url);
}

export async function saveMasterEvent(payload: any) {
    const url = '/master_coe/addOrUpdate_master_event';
    return await api.post<any[]>('coe', url, payload);
}

export async function getCoeReport(data: {
    type: string | number;
    ASMAY_Id: number;
    ASMCL_Id: number;
    Monthid: number;
    COEE_EStartDate: string;
    COEE_EEndDate: string;
    [key: string]: any;
}) {
    const url = `/COEReport/getReport?type=${data.type}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&Monthid=${data.Monthid}&COEE_EStartDate=${data.COEE_EStartDate}&COEE_EEndDate=${data.COEE_EEndDate}`;
    return await api.post<any>('admission', url, data);
}
export async function toggleUploadEvent(id: number, coee_Id: number) {
    const url = `/master_coe/active_deactive_coe_event/${id}`;
    return await api.put('coe', url);
}

export async function getCoeInitialData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_coe/event_mapped_details_grid?${urlParams}`;
    console.log('URL:', url);
    const res = await api.get<any[]>('coe', url);
    return res;
}

export async function EventDetailsById(id: number) {
    const url = `/master_coe/event_details_by_event_id/${id}`;
    return await api.get<MasterEventCoe[]>('coe', url);
}

export async function saveMappedEvent(payload: any) {
    const url = '/master_coe/addOrUpdate_mapped_coe_event';
    console.log('Payload:', payload);
    return await api.post<any[]>('coe', url, payload);
}

export async function toggleMappedEvent(coemE_Id: number, coee_Id: number) {
    const url = `/master_coe/active_deactive_coe_mapped_event/${coemE_Id}/${coee_Id}`;
    return await api.put('coe', url);
}

export async function getMappedEventDetails(id: number) {
    const url = `/master_coe/view_details_by_id/${id}`;
    return await api.get<any>('coe', url);
}
