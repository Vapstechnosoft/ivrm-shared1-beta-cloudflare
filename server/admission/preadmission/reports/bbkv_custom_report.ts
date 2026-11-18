'use server';

import { api } from '@/lib/apiService';

/**
 * Nagarjuna TC Custom Report (legacy BBKV endpoints)
 */

export async function getBbkvCustomReportDetails() {
    const url = '/BBKVCustomReport/getdetails';
    return await api.get<any>('admission', url);
}

export async function getBbkvCustomReportNameRegNo(data: {
    admnoorname: string;
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    tctemporper: string;
}) {
    const url = `/BBKVCustomReport/getnameregno?tctemporper=${data.tctemporper}&admnoorname=${data.admnoorname}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id || 0}&ASMS_Id=${data.ASMS_Id || 0}`;
    return await api.post<any>('admission', url);
}

export async function getBbkvCustomReportStdNameChange(data: {
    AMST_Id: number;
    ASMAY_Id: number;
}) {
    const url = `/BBKVCustomReport/stdnamechange?ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, data);
}

export async function getBbkvCustomReportTempPerChange(data: {
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    admnoorname: string;
    tctemporper: string;
}) {
    const url = `/BBKVCustomReport/onclicktcperortemo?tctemporper=${data.tctemporper}&admnoorname=${data.admnoorname}&ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url);
}

export async function getBbkvCustomReportTcDetails(data: {
    ASMAY_Id: number;
    AMST_Id: number;
    tctemporper: string;
}) {
    const url = `/BBKVCustomReport/getTcdetails?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url);
}
