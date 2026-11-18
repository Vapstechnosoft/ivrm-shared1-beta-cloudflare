'use server';

import { api } from '@/lib/apiService';

export async function getMobileAppDownloadLoadData() {
    return await api.get<any>('admission', `/InteractionDelete/mobload/`);
}

export async function getMobileAppDownloadReport(params: {
    fromdate: string;
    todate: string;
    ASMAY_Id: number;
    Active: number;
    DeActive: number;
    Left: number;
    optionflag: string;
}) {
    const url = `/InteractionDelete/mobreport?optionflag=${params.optionflag}&ASMAY_Id=${params.ASMAY_Id}&fromdate=${params.fromdate}&todate=${params.todate}&Active=${params.Active}&DeActive=${params.DeActive}&Left=${params.Left}`;
    return await api.post<any>('admission', url, {});
}
