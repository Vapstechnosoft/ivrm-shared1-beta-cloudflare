'use server';

import { api } from '@/lib/apiService';

/**
 * Loads initial data for USA College Study Certificate Report
 * Endpoint: /CollegeStudyCertificateReport/getdata
 */
export async function getUSAStudyCertificateLoadData() {
    const url = '/CollegeStudyCertificateReport/getdata';
    return await api.get<any>('admission', url);
}

/**
 * Handles Academic Year change to fetch courses
 * Endpoint: /CollegeStudyCertificateReport/onchangeyear
 */
export async function onUSAStudyCertYearChange(data: { ASMAY_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangeyear?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('admission', url, {});
}

/**
 * Handles Course change to fetch branches
 * Endpoint: /CollegeStudyCertificateReport/onchangecourse
 */
export async function onUSAStudyCertCourseChange(data: { ASMAY_Id: number; AMCO_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangecourse?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}`;
    return await api.post<any>('admission', url, {});
}

/**
 * Handles Branch change to fetch semesters
 * Endpoint: /CollegeStudyCertificateReport/onchangebranch
 */
export async function onUSAStudyCertBranchChange(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangebranch?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}`;
    return await api.post<any>('admission', url, {});
}

/**
 * Handles Semester change to fetch sections
 * Endpoint: /CollegeStudyCertificateReport/onchangesemester
 */
export async function onUSAStudyCertSemesterChange(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
}) {
    const url = `/CollegeStudyCertificateReport/onchangesemester?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}`;
    return await api.post<any>('admission', url, {});
}

/**
 * Searches for students based on criteria
 * Endpoint: /CollegeStudyCertificateReport/searchfilter
 */
export async function searchUSAStudyCertStudents(data: {
    ASMAY_Id: number;
    AMCST_SOL: string;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMS_Id: number;
    allorindid: string;
    searchfilter?: string;
    filterinitialdata?: string;
}) {
    const searchFilterParam = encodeURIComponent(data.searchfilter || '');
    const url = `/CollegeStudyCertificateReport/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMCST_SOL=${data.AMCST_SOL}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&allorindid=${data.allorindid}&searchfilter=${searchFilterParam}`;
    return await api.post<any>('admission', url, {});
}

/**
 * Generates the report data
 * Endpoint: /CollegeStudyCertificateReport/onclickreport
 */
export async function getUSAStudyCertReport(data: {
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
