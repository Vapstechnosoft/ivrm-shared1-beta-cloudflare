'use server';

import { api } from '@/lib/apiService';
import type { IMasterClassYearlyList } from '@/types/exam/exam-module/masters';
import type { IAcademicYearandClassandsection } from '@/types/exam/exam-module/report';

/**
 * Get Academic Year Dropdown
 */
export async function getExamAcademicYearDropdown() {
    const url = '/exam_master/get_academic_year_list';
    return await api.get<IMasterClassYearlyList[]>('exam', url).catch(() => null);
}

function extractDataList(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && typeof res.data === 'object') {
        const arr =
            res.data.classlist ||
            res.data.classList ||
            res.data.getclasslist ||
            res.data.fillclass ||
            res.data.sectionlist ||
            res.data.sectionList ||
            res.data.getsectionlist ||
            res.data.fillsection ||
            res.data.studentlist ||
            res.data.studentList ||
            res.data.getstudentdetails ||
            [];
        if (Array.isArray(arr)) return arr;
    }
    if (typeof res === 'object') {
        const arr =
            res.classlist ||
            res.classList ||
            res.getclasslist ||
            res.fillclass ||
            res.sectionlist ||
            res.sectionList ||
            res.getsectionlist ||
            res.fillsection ||
            res.studentlist ||
            res.studentList ||
            res.getstudentdetails ||
            [];
        if (Array.isArray(arr)) return arr;
    }
    return [];
}

/**
 * Get Class Dropdown by Academic Year
 */
export async function getClassDropDownByAcademicYearlist(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');

    // 1. Try Primary GET Endpoint
    const url = `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}`;
    const res = await api.get<IAcademicYearandClassandsection[]>('exam', url).catch(() => null);
    if (extractDataList(res).length > 0) return res;

    // 2. Try JSHS POST Endpoint
    const payload = { ASMAY_Id: asmaY_Id };
    const jshsRes = await api.post<any>('exam', '/JSHSExamReports_/get_classes', payload).catch(() => null);
    if (extractDataList(jshsRes).length > 0) return jshsRes;

    return res || jshsRes;
}

/**
 * Get Sections by Academic Year and Class
 */
export async function getSectionsDropDownByAcademicYearandClasslist(asmaY_Id: number, asmcL_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');

    // 1. Try Primary GET Endpoint (Class ID / Year ID)
    const url = `/exam_master_category/sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`;
    const res = await api.get<IAcademicYearandClassandsection[]>('exam', url).catch(() => null);
    if (extractDataList(res).length > 0) return res;

    // 2. Try Swapped GET Endpoint (Year ID / Class ID)
    const urlSwapped = `/exam_master_category/sections_drop_down_by_class_list/${asmaY_Id}/${asmcL_Id}`;
    const resSwapped = await api.get<IAcademicYearandClassandsection[]>('exam', urlSwapped).catch(() => null);
    if (extractDataList(resSwapped).length > 0) return resSwapped;

    // 3. Try JSHS POST Endpoint
    const payload = { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id };
    const jshsRes = await api.post<any>('exam', '/JSHSExamReports_/get_sections', payload).catch(() => null);
    if (extractDataList(jshsRes).length > 0) return jshsRes;

    return res || resSwapped || jshsRes;
}

/**
 * Get Students by Academic Year, Class, and Section
 */
export async function getStudentsDropDownByAcademicYearandClassandSectionlist(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    if (!asmS_Id) throw new Error('Section ID is required');

    // 1. Try Primary GET Endpoint
    const url = `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}&ASMS_Id=${asmS_Id}`;
    const res = await api.get<IAcademicYearandClassandsection[]>('exam', url).catch(() => null);
    if (extractDataList(res).length > 0) return res;

    // 2. Try JSHS POST Endpoint
    const payload = { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id, ASMS_Id: asmS_Id };
    const jshsRes = await api.post<any>('exam', '/JSHSExamReports_/GetStudentDetails', payload).catch(() => null);
    if (extractDataList(jshsRes).length > 0) return jshsRes;

    return res || jshsRes;
}

/**
 * Get GMVPS Progress Card IX Report Data
 */
export async function getGmvpsProgressCardIXReport(payload: any) {
    const endpoints = [
        '/JSHSExamReports_/nds_1_5_report',
        '/JSHSExamReports_/nds_6_8_report',
        '/JSHSExamReports_/nds_9_report',
        '/JSHSExamReports/nds_1_5_report',
        '/JSHSExamReports/nds_6_8_report',
        '/JSHSExamReports/nds_9_report'
    ];

    for (const ep of endpoints) {
        try {
            const res = await api.post<any>('exam', ep, payload);
            const raw = res?.data || res;
            if (raw && (raw.studentlist || raw.griddata || raw.datareport || raw.reportdata)) {
                return res;
            }
        } catch (e) {
            console.warn(`[getGmvpsProgressCardIXReport] ${ep} failed:`, e);
        }
    }
    return await api.post<any>('exam', '/JSHSExamReports_/nds_1_5_report', payload);
}
