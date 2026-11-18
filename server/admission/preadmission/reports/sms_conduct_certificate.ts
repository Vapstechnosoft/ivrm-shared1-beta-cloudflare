'use server';

import { api } from '@/lib/apiService';

/**
 * Loads initial data for SMS College Study Certificate Report
 */
export async function getSMSCConductCertLoadData() {
    const url = '/CollegeStudyCertificateReport/getdata';
    return await api.get<any>('admission', url);
}

/**
 * Handles Academic Year change to fetch courses
 */
export async function onSMSCConductCertYearChange(data: { ASMAY_Id: number }) {
    // const url = '/CollegeStudyCertificateReport/onchangeyear';
    // return await api.post<any>('admission', url, data);
    const url = `/CollegeStudyCertificateReport/onchangeyear?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, {});
}

/**
 * Handles Course change to fetch branches
 */
export async function onSMSCConductCertCourseChange(data: { ASMAY_Id: number; AMCO_Id: number }) {
    const url = '/CollegeStudyCertificateReport/onchangecourse';
    return await api.post<any>('admission', url, data);
}

/**
 * Handles Branch change to fetch semesters
 */
export async function onSMSCConductCertBranchChange(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    const url = '/CollegeStudyCertificateReport/onchangebranch';
    return await api.post<any>('admission', url, data);
}

/**
 * Handles Semester change to fetch sections
 */
export async function onSMSCConductCertSemesterChange(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number }) {
    // const url = '/CollegeStudyCertificateReport/onchangesemester';
    // return await api.post<any>('admission', url, data);
    const url = `/CollegeStudyCertificateReport/onchangesemester?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}`;
    return await api.post<any>('admission', url, {});
}

/**
 * Searches for students based on criteria
 */
export async function searchSMSCConductCertStudents(data: {
    filterinitialdata: string;
    searchfilter: string;
    ASMAY_Id: number;
    AMCST_SOL: string;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMS_Id: number;
    allorindid: string;
}) {
    // const url = '/CollegeStudyCertificateReport/searchfilter';
    // return await api.post<any>('admission', url, data);
    const url = `/CollegeStudyCertificateReport/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMCST_SOL=${data.AMCST_SOL}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&allorindid=${data.allorindid}`;
    return await api.post<any>('admission', url, {});
}

/**
 * Generates the report data
 */
export async function getSMSCConductCertReport(data: {
    ASMAY_Id: number;
    AMCST_SOL: string;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMS_Id: number;
    AMCST_Id: number;
    allorindid: string;
}) {
    // const url = '/CollegeStudyCertificateReport/onclickreport';
    // return await api.post<any>('admission', url, data);
    const url = `/CollegeStudyCertificateReport/onclickreport?ASMAY_Id=${data.ASMAY_Id}&AMCST_SOL=${data.AMCST_SOL}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&AMCST_Id=${data.AMCST_Id}&allorindid=${data.allorindid}`;
    return await api.post<any>('admission', url, {});
}
