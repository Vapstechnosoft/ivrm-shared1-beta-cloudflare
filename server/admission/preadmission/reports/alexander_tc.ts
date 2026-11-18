'use server';

import { api } from '@/lib/apiService';

/**
 * Fetches initial data (Years, Classes, Sections)
 */
export async function getAlexanderTcLoadData() {
    const url = '/StudenttcCustomReport/getinitialdata';
    return await api.get<any>('admission', url);
}

export async function getAlexanderTcChangeYear(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    search?: string;
}) {
    const url = `/StudenttcCustomReport/changeyear?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&report_type=${data.report_type}&admnoorname=${data.search || ''}`;
    return await api.get<any>('admission', url);
}


export async function getAlexanderTcChangeClass(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    ASMCL_Id: number;
    search?: string;
}) {
    const url = `/StudenttcCustomReport/changeclass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&admnoorname=${data.search || ''}`;
    return await api.get<any>('admission', url);
}
export async function getAlexanderTcChangeSection(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    ASMCL_Id: number;
    ASMS_Id: number;
    search?: string;
}) {
    const url = `/StudenttcCustomReport/changesection?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&admnoorname=${data.search || ''}`;
    return await api.get<any>('admission', url);
}

export async function getAlexanderTcDetails(data: {
    ASMAY_Id: number;
    AMST_Id: number;
    tctemporper: string;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    search?: string;
    report_type: string;
    Boardtype?: string;
    BSPID?: string;
    Previous_School_Name?: string;
}) {
    const url = `/StudenttcCustomReport/getTCdata?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id || 0}&ASMS_Id=${data.ASMS_Id || 0}&AMST_Id=${data.AMST_Id}&report_type=${data.report_type}&admnoorname=${data.search || ''}`;
    return await api.get<any>('admission', url);
}