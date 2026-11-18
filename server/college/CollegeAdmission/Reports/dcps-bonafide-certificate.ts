'use server';

import { api } from '@/lib/apiService';

/**
 * Loads initial data for DCPS Bonafide Certificate
 */
export async function getDCPSBonafideLoadData() {
    const url = '/CollegeStudyCertificateReport/getdata';
    return await api.get<any>('college', url);
}

/**
 * Handles Academic Year change to fetch courses
 */
export async function changeYearDCPSBonafide(data: { ASMAY_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangeyear?ASMAY_Id=${data.ASMAY_Id}`;
    return await api.post<any>('college', url, data);
}

/**
 * Handles Course change to fetch branches
 */
export async function changeCourseDCPSBonafide(data: { ASMAY_Id: number; AMCO_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangecourse?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}`;
    return await api.post<any>('college', url, data);
}

/**
 * Handles Branch change to fetch semesters
 */
export async function changeBranchDCPSBonafide(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    const url = `/CollegeStudyCertificateReport/onchangebranch?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}`;
    return await api.post<any>('college', url, data);
}

/**
 * Handles Semester change to fetch sections
 */
export async function changeSemesterDCPSBonafide(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
}) {
    const url = `/CollegeStudyCertificateReport/onchangesemester?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}`;
    return await api.post<any>('college', url, data);
}

/**
 * Searches for students based on criteria
 */
export async function searchDCPSBonafideStudents(data: {
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
    const url = `/CollegeStudyCertificateReport/searchfilter?ASMAY_Id=${data.ASMAY_Id}&AMCST_SOL=${data.AMCST_SOL}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&allorindid=${data.allorindid}&searchfilter=${encodeURIComponent(data.searchfilter || '')}`;
    return await api.post<any>('college', url, data);
}

/**
 * Generates the report data for certificate
 */
export async function getDCPSBonafideReport(data: {
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
    return await api.post<any>('college', url, data);
}
