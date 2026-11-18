'use server';

import { api } from '@/lib/apiService';

export async function getCountStatusReportInitialDetails() {
    const url = `/countstatusreport/getinitialdata`;
    return await api.get<any>('preadmission', url);
}

export async function getCountStatusReportData(data: { ASMAY_Id: number }) {
    const url = `/countstatusreport/Getdetail?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('preadmission', url);
}
