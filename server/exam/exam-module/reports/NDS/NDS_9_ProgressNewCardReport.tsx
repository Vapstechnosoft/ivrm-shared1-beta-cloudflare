'use server';

import { api } from '@/lib/apiService';
import type { NDS9ReportData, NDS9ReportPayload, NDS9ReportResponse, NDS15ReportData } from '@/types/exam/NDS/NDS_9_ProgressNewCardReport';

function extractDataList(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    if (res.data && typeof res.data === 'object') {
        const arr =
            res.data.getclasslist ||
            res.data.classlist ||
            res.data.classList ||
            res.data.fillclass ||
            res.data.getsectionlist ||
            res.data.sectionlist ||
            res.data.sectionList ||
            res.data.fillsection ||
            res.data.getstudentdetails ||
            res.data.studentlist ||
            res.data.studentList ||
            [];
        if (Array.isArray(arr) && arr.length > 0) return arr;
    }
    if (typeof res === 'object') {
        const arr =
            res.getclasslist ||
            res.classlist ||
            res.classList ||
            res.fillclass ||
            res.getsectionlist ||
            res.sectionlist ||
            res.sectionList ||
            res.fillsection ||
            res.getstudentdetails ||
            res.studentlist ||
            res.studentList ||
            [];
        if (Array.isArray(arr) && arr.length > 0) return arr;
    }
    if (Array.isArray(res.data)) return res.data;
    return [];
}

export async function getClasses(asmay_id: number) {
    const payload = { ASMAY_Id: asmay_id };

    // 1. Try POST /JSHSExamReports_/get_classes
    try {
        const res1 = await api.post<any>('exam', '/JSHSExamReports_/get_classes', payload);
        if (extractDataList(res1).length > 0) return res1;
    } catch (e) {
        console.warn('POST /JSHSExamReports_/get_classes failed:', e);
    }

    // 2. Try POST /JSHSExamReports/get_classes (without underscore)
    try {
        const res2 = await api.post<any>('exam', '/JSHSExamReports/get_classes', payload);
        if (extractDataList(res2).length > 0) return res2;
    } catch (e) {
        console.warn('POST /JSHSExamReports/get_classes failed:', e);
    }

    // 3. Try GET /exam_master_category/class_drop_down_by_academic_year_list/${asmay_id}
    try {
        const res3 = await api.get<any>('exam', `/exam_master_category/class_drop_down_by_academic_year_list/${asmay_id}`);
        if (extractDataList(res3).length > 0) return res3;
    } catch (e) {
        console.warn('GET /exam_master_category/class_drop_down_by_academic_year_list failed:', e);
    }

    return [];
}

export async function getSections(asmay_id: number, asmcl_id: number) {
    const payload = { ASMAY_Id: asmay_id, ASMCL_Id: asmcl_id };

    // 1. Try POST /JSHSExamReports_/get_sections
    try {
        const res1 = await api.post<any>('exam', '/JSHSExamReports_/get_sections', payload);
        if (extractDataList(res1).length > 0) return res1;
    } catch (e) {
        console.warn('POST /JSHSExamReports_/get_sections failed:', e);
    }

    // 2. Try POST /JSHSExamReports/get_sections (without underscore)
    try {
        const res2 = await api.post<any>('exam', '/JSHSExamReports/get_sections', payload);
        if (extractDataList(res2).length > 0) return res2;
    } catch (e) {
        console.warn('POST /JSHSExamReports/get_sections failed:', e);
    }

    // 3. Try GET /exam_master_category/sections_drop_down_by_class_list
    try {
        const res3 = await api.get<any>('exam', `/exam_master_category/sections_drop_down_by_class_list/${asmcl_id}/${asmay_id}`);
        if (extractDataList(res3).length > 0) return res3;
    } catch (e) {
        console.warn('GET sections failed:', e);
    }

    return [];
}

export async function getStudents(asmay_id: number, asmcl_id: number, asms_id: number) {
    const payload = { ASMAY_Id: asmay_id, ASMCL_Id: asmcl_id, ASMS_Id: asms_id };

    // 1. Try POST /JSHSExamReports_/GetStudentDetails
    try {
        const res1 = await api.post<any>('exam', '/JSHSExamReports_/GetStudentDetails', payload);
        if (extractDataList(res1).length > 0) return res1;
    } catch (e) {
        console.warn('POST /JSHSExamReports_/GetStudentDetails failed:', e);
    }

    // 2. Try POST /JSHSExamReports/GetStudentDetails (without underscore)
    try {
        const res2 = await api.post<any>('exam', '/JSHSExamReports/GetStudentDetails', payload);
        if (extractDataList(res2).length > 0) return res2;
    } catch (e) {
        console.warn('POST /JSHSExamReports/GetStudentDetails failed:', e);
    }

    // 3. Try GET /exam_master_category/students_drop_down_by_year_class_section_list
    try {
        const res3 = await api.get<any>(
            'exam',
            `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmay_id}&ASMCL_Id=${asmcl_id}&ASMS_Id=${asms_id}`
        );
        if (extractDataList(res3).length > 0) return res3;
    } catch (e) {
        console.warn('GET students failed:', e);
    }

    return [];
}

export async function getNDS9Report(payload: NDS9ReportPayload): Promise<NDS9ReportData> {
    try {
        const response = await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
        if (response) {
            return {
                success: response?.success ?? true,
                data: (response?.data || response) as any as NDS9ReportResponse,
                message: response?.message
            };
        }
    } catch (e) {
        console.warn('POST /JSHSExamReports_/nds_6_8_report failed:', e);
    }

    try {
        const response = await api.post<any>('exam', '/JSHSExamReports/nds_6_8_report', payload);
        return {
            success: response?.success ?? true,
            data: (response?.data || response) as any as NDS9ReportResponse,
            message: response?.message
        };
    } catch (e: any) {
        return {
            success: false,
            data: null as any,
            message: e?.message || 'Failed to generate report'
        };
    }
}

export async function getNDS15Report(payload: NDS9ReportPayload): Promise<NDS15ReportData> {
    return getNDS9Report(payload) as any;
}
