'use server';

import { api } from '@/lib/apiService';

export async function onlinepaymentdetails(data?: any) {
    const url = '/FeeOnlinePaymentFacade/getdetails';
    return await api.post<any>('fees', url, data);
}

export async function OnlinePaymentSeelctedTermDetails(data?: any) {
    const url = '/FeeOnlinePaymentFacade/getamountdetails';
    return await api.post<any>('fees', url, data);
}

export async function OpenOnlinePaymentGateway(data?: any) {
    const url = '/FeeOnlinePaymentFacade/generatehashsequence';
    return await api.post<any>('fees', url, data);
}
