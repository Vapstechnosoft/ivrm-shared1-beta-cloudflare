'use server';

import { api } from '@/lib/apiService';
import type { ISRKVSInitialData, ISRKVSSubEvent, ISRKVSSubSubEvent } from '@/types/sports/reports/srkvs-sports-report';

export async function Getdetails(data: { asmaY_Id?: number }) {
    return await api.post<ISRKVSInitialData>('sports', 'SRKVSSportsReport/Getdetails', data);
}

export async function get_class(data: { asmaY_Id: number }) {
    return await api.post<ISRKVSInitialData>('sports', 'SRKVSSportsReport/get_class', data);
}

export async function get_SportsName(data: { asmaY_Id: number; spccmsccG_Id: number }) {
    return await api.post<{ sportsCCList: ISRKVSSubEvent[] }>('sports', 'SRKVSSportsReport/get_SportsName', data);
}

export async function get_uom_Name(data: { asmaY_Id: number; spccmscC_Id: number }) {
    return await api.post<{ uomList: any[]; getsubsubevent: ISRKVSSubSubEvent[] }>('sports', 'SRKVSSportsReport/get_uom_Name', data);
}

// Ensure the return type matches what we expect from the API.
// Based on the user request, the API returns different structures (getReport, getReportfinish, etc.)
// We will return 'any' here and handle the typing/transformation in the hook or component.
export async function showdetails(data: any) {
    return await api.post<any>('sports', 'SRKVSSportsReport/showdetails', data);
}
