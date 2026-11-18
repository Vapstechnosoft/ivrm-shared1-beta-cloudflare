'use server';

import { api } from '@/lib/apiService';

/**
 * Loads initial data for Danvantari Bonafide Certificate
 */
export async function getDanvantariBonafideLoadData() {
    // Note: Using the exact same pattern as working master_class_category API
    const url = '/CollegeStudyCertificateReport/getdata';
    console.info('📡 [DANVANTARI] Fetching load data from:', url);
    return await api.get<any>('admission', url);
}

export async function changeYearDanvantariBonafide(data: { ASMAY_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangeyear?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function changeCourseDanvantariBonafide(data: { ASMAY_Id: number; AMCO_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangecourse?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function changeBranchDanvantariBonafide(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangebranch?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function changeSemesterDanvantariBonafide(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangesemester?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}`;
    return await api.post<any>('admission', url, {});
}

export async function getDanvantariBonafideSearchFilter(data: {
    AMCO_Id: number;
    ASMAY_Id: number;
    AMB_Id: number;
    searchfilter: string;
    AMCST_SOL: string;
}) {
    const url = `/CollegeStudyCertificateReport/searchfilter?AMCO_Id=${data.AMCO_Id}&ASMAY_Id=${data.ASMAY_Id}&AMB_Id=${data.AMB_Id}&searchfilter=${data.searchfilter}&AMCST_SOL=${data.AMCST_SOL}`;
    return await api.post<any>('admission', url, {});
}

export async function getDanvantariBonafideReport(data: {
    ASMAY_Id: number;
    AMCST_SOL: string;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMS_Id: number;
    AMCST_Id: number;
    allorindid: string;
}) {
    const url = `/CollegeStudyCertificateReport/onclickreport?ASMAY_Id=${data.ASMAY_Id}&AMCST_SOL=${data.AMCST_SOL}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&AMCST_Id=${data.AMCST_Id}&allorindid=${data.allorindid}`;
    return await api.post<any>('admission', url, {});
}
