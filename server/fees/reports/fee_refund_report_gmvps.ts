'use server';

import { api } from '@/lib/apiService';

export async function getFeeHeadDropDown() {
    const url = '/FeesCommon/fee-head';
    return await api.get<any[]>('fees', url);
}

export async function getFeeRefundReport(payload: any) {
    const url = '/FeeRefund/GetReport';
    return await api.post<any[]>('fees', url, payload);
}

export async function getFeeCollectionReportVVVS(payload: any) {
    const url = '/FeeDailycollection/VidyavikasDailyCollection';
    return await api.post<any[]>('fees', url, payload);
}

export async function getFeeDemandRegisterGMVPS(payload: any) {
    const url = '/FeeDemandRegisterFacade/DemandRegisterReport';
    return await api.post<any[]>('fees', url, payload);
}
