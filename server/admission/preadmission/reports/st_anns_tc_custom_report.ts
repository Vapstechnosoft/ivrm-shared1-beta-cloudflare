'use server';

import { api } from '@/lib/apiService';

export async function getStAnnsTcLoadData() {
    const url = '/StudenttcCustomReport/getinitialdata';
    return await api.get<any>('admission', url);
}

export async function changeStAnnsTcYear(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
}) {
    const url = `/StudenttcCustomReport/changeyear?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&report_type=${data.report_type}`;
    return await api.get<any>('admission', url);
}

export async function changeStAnnsTcClass(data: {
    ASMAY_Id: number;
    tctemporper: string;
    report_type: string;
    ASMCL_Id: number;
}) {
    const url = `/StudenttcCustomReport/changeclass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&tctemporper=${data.tctemporper}&report_type=${data.report_type}`;
    return await api.get<any>('admission', url);
}

export async function changeStAnnsTcSection(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    tctemporper: string;
    report_type: string;
}) {
    const url = `/StudenttcCustomReport/changesection?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&report_type=${data.report_type}`;
    return await api.get<any>('admission', url);
}

export async function getStAnnsTcDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    AMST_Id: number;
    tctemporper: string;
}) {
    const url = `/StudenttcCustomReport/getTCdata?tctemporper=${data.tctemporper}&ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&AMST_Id=${data.AMST_Id}`;
    return await api.get<any>('admission', url);
}
