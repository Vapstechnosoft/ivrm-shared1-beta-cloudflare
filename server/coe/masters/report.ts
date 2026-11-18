'use server';

import { api } from '@/lib/apiService';

export async function getCoeMonthEndReport(payload: any) {
    const url = '/COEReport/getdata';
    return await api.get<any>('admission', url, { params: payload });
}

export async function getCoeMonthEndReportResult(data: {
    ASMAY_Id: number;
    Monthid: number;
    [key: string]: any;
}) {
    const url = `/COEReport/mothreport?ASMAY_Id=${data.ASMAY_Id}&Monthid=${data.Monthid}`;
    return await api.post<any>('admission', url, data);
}
