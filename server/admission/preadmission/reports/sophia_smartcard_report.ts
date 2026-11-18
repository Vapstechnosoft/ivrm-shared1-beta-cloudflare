'use server';

import { api } from '@/lib/apiService';

export async function getSmartcardLoadData() {
    return await api.get<any>('admission', '/Smartcarddetails/getinitialdata');
}

export async function getSmartcardReportData(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    stdmobilenumber: string; // Used for Regular/New radio
}) {
    const url = `/Smartcarddetails/searchdata?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&stdmobilenumber=${data.stdmobilenumber}`;
    return await api.post<any>('admission', url);
}
