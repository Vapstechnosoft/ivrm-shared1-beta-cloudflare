'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data for NDA TC report (Years, Classes, etc.)
 */
export async function getNdaTcInitialData() {
    const url = '/BBKVCustomReport/getdetails';
    return await api.get<any>('admission', url);
}

/**
 * Fetches student list based on search criteria for NDA TC
 */
export async function getNdaTcStudentList(data: {
    admnoorname: string;
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    tctemporper: string;
}) {
    const url = `/BBKVCustomReport/getnameregno?tctemporper=${data.tctemporper}&admnoorname=${data.admnoorname}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id || 0}&ASMS_Id=${data.ASMS_Id || 0}`;
    return await api.post<any>('admission', url);
}

/**
 * Fetches student name/regno change details for NDA TC
 */
export async function getNdaTcStudentNameChange(data: {
    AMST_Id: number;
    ASMAY_Id: number;
}) {
    const url = `/BBKVCustomReport/stdnamechange?ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, data);
}

/**
 * Handles click event for temp/permanent student radio buttons (NDA TC)
 */
export async function onNdaTcTempPerChange(data: {
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    admnoorname: string;
    tctemporper: string;
}) {
    const url = `/BBKVCustomReport/onclicktcperortemo?tctemporper=${data.tctemporper}&admnoorname=${data.admnoorname}&ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url);
}

/**
 * Fetches final TC details for a student (NDA TC)
 * Legacy uses 'getTcdetails' for NDA/BBKV format
 */
export async function getNdaTcDetails(data: {
    ASMAY_Id: number;
    AMST_Id: number;
    tctemporper: string;
}) {
    const url = `/BBKVCustomReport/getTcdetails?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url);
}
