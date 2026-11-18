'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data for Custom-TC report (Years, Classes, etc.)
 * @param id Institution/Module ID (Legacy uses 2)
 */
export async function getCustomTcInitialData() {
    const url = '/StudenttcCustomReport/getinitialdata';
    return await api.get<any>('admission', url);
}

/**
 * Fetches student list based on search criteria
 */
export async function getCustomTcStudentList(data: {
    admnoorname: string;
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    tctemporper: string;
}) {
    const url = `/StudenttcCustomReport/changeyear?tctemporper=${data.tctemporper}&admnoorname=${data.admnoorname}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id || 0}&ASMS_Id=${data.ASMS_Id || 0}&report_type=All`;
    return await api.get<any>('admission', url);
}

/**
 * Fetches data on class change
 */
export async function getCustomTcChangeClass(data: {
    admnoorname: string;
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id?: number;
    tctemporper: string;
}) {
    const url = `/StudenttcCustomReport/changeclass?tctemporper=${data.tctemporper}&admnoorname=${data.admnoorname}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id || 0}&report_type=All`;
    return await api.get<any>('admission', url);
}

/**
 * Fetches data on section change
 */
export async function getCustomTcChangeSection(data: {
    admnoorname: string;
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    tctemporper: string;
}) {
    const url = `/StudenttcCustomReport/changesection?tctemporper=${data.tctemporper}&admnoorname=${data.admnoorname}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&report_type=All`;
    return await api.get<any>('admission', url);
}

/**
 * Fetches student name/regno change details
 */
export async function getCustomTcStudentNameChange(data: {
    AMST_Id: number;
    ASMAY_Id: number;
}) {
    const url = `/BBKVCustomReport/stdnamechange?ASMAY_Id=${data.ASMAY_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.post<any>('admission', url, data);
}

/**
 * Handles click event for temp/permanent student radio buttons
 */
export async function onCustomTcTempPerChange(data: {
    ASMAY_Id: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    admnoorname: string;
    tctemporper: string;
}) {
    const url = `/BBKVCustomReport/onclicktcperortemo?tctemporper=${data.tctemporper}&admnoorname=${data.admnoorname}&ASMAY_Id=${data.ASMAY_Id}`;
    return await api.get<any>('admission', url);
}

/**
 * Fetches final TC details for a student
 */
export async function getCustomTcDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    AMST_Id: number;
    tctemporper: string;
}) {
    const url = `/StudenttcCustomReport/getTCdata?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.get<any>('admission', url);
}
