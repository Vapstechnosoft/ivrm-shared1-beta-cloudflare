'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IAcademicYearandClassandsection } from '@/types/exam/exam-module/report';

// 🔹 Cumulative Report Submit

export async function getCumulativeReport(data: any, apiSearchParams?: ApiSearchparams) {
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    const miId = session?.mi_id ? Number(session.mi_id) : (session?.user as any)?.mi_id ? Number((session?.user as any)?.mi_id) : 0;

    const urlParams = getSearchParamsUrl(apiSearchParams ?? {});
    const url = urlParams ? `/cumulative_report?${urlParams}` : '/cumulative_report';
    const payload = {
        ...(miId > 0 ? { MI_Id: miId, mI_Id: miId, mi_id: miId } : {}),
        ...data
    };
    const response = await api.post<any>('exam', url, payload);
    return response;
}

function extractArray(res: any, ...keys: string[]): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.$values)) return res.data.$values;
    if (Array.isArray(res?.$values)) return res.$values;

    for (const key of keys) {
        if (Array.isArray(res[key])) return res[key];
        if (Array.isArray(res?.data?.[key])) return res.data[key];
        if (Array.isArray(res?.data?.[key]?.$values)) return res.data[key].$values;
    }

    const target = res.data && typeof res.data === 'object' ? res.data : res;
    if (target && typeof target === 'object') {
        for (const k of Object.keys(target)) {
            if (Array.isArray(target[k])) return target[k];
            if (Array.isArray(target[k]?.$values)) return target[k].$values;
        }
    }

    return [];
}

// 🔹 Class Dropdown
export async function getClassDropDownByAcademicYearlist(asmaY_Id: number) {
    try {
        if (!asmaY_Id) return { success: false, message: 'Academic Year ID is required', data: [] };

        // 1. Try exam master category class dropdown
        const url = `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}`;
        const res: any = await api.get('exam', url);
        let data = extractArray(res, 'classlist', 'getclass', 'classes', 'classList');

        // 2. Fallback: Try fees class dropdown list
        if (data.length === 0) {
            try {
                const resFee: any = await api.post('fees', `/fee_class_category/class_drop_down_list?asmay_id=${asmaY_Id}`, {});
                data = extractArray(resFee, 'classlist', 'getclass', 'classes', 'classList');
            } catch { }
        }

        // 3. Fallback: Try master class dropdown list
        if (data.length === 0) {
            try {
                const resApp: any = await api.get('preadmission', '/student_application_form/master_class_drop_down_list');
                data = extractArray(resApp, 'classlist', 'getclass', 'classes', 'classList');
            } catch { }
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Error in getClassDropDownByAcademicYearlist:', error);
        return { success: false, message: error?.message || 'Failed to fetch classes', data: [] };
    }
}

// 🔹 Section Dropdown
export async function getSectionsDropDownByAcademicYearandClasslist(asmaY_Id: number, asmcL_Id: number) {
    try {
        if (!asmaY_Id || !asmcL_Id) return { success: false, message: 'Academic Year and Class ID are required', data: [] };

        // 1. Standard exam section dropdown
        const url = `/exam_master_category/sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`;
        const res: any = await api.get('exam', url);
        let data = extractArray(res, 'sectionlist', 'getsection', 'sections', 'sectionList');

        // 2. Swapped order parameter fallback
        if (data.length === 0) {
            try {
                const urlSwapped = `/exam_master_category/sections_drop_down_by_class_list/${asmaY_Id}/${asmcL_Id}`;
                const resSwapped: any = await api.get('exam', urlSwapped);
                data = extractArray(resSwapped, 'sectionlist', 'getsection', 'sections', 'sectionList');
            } catch { }
        }

        // 3. Unmapped sections fallback
        if (data.length === 0) {
            try {
                const urlUnmapped = `/exam_master_category/un_mapped_sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`;
                const resUnmapped: any = await api.get('exam', urlUnmapped);
                data = extractArray(resUnmapped, 'sectionlist', 'getsection', 'sections', 'sectionList');
            } catch { }
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Error in getSectionsDropDownByAcademicYearandClasslist:', error);
        return { success: false, message: error?.message || 'Failed to fetch sections', data: [] };
    }
}

// 🔹 Exam Dropdown
export async function getExamsDropDownByAcademicYearandClassandSectionlist(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    try {
        if (!asmaY_Id || !asmcL_Id || asmS_Id === undefined || asmS_Id === null) {
            return { success: false, message: 'Academic Year, Class, and Section ID are required', data: [] };
        }

        // 1. Try specific year, class, and section exam dropdown
        const url = `/exam_master/exam_drop_down_by_year_class_section_list/${asmaY_Id}/${asmcL_Id}/${asmS_Id}`;
        const res: any = await api.get('exam', url);
        let data = extractArray(res, 'examlist', 'getexam', 'exams', 'examList', 'getexamdetails');

        // 2. Fallback: Try /exam_master/exam_master_order_list
        if (data.length === 0) {
            try {
                const resOrder: any = await api.get('exam', '/exam_master/exam_master_order_list');
                data = extractArray(resOrder, 'examlist', 'getexam', 'exams', 'examList', 'master_exam_list', 'exam_list');
            } catch { }
        }

        // 3. Fallback: Try /exam_master
        if (data.length === 0) {
            try {
                const resMaster: any = await api.get('exam', '/exam_master');
                data = extractArray(resMaster, 'examlist', 'getexam', 'exams', 'examList', 'master_exam_list', 'exam_list');
            } catch { }
        }

        // 4. Fallback: Try /exam_master/get_exam_list/${asmaY_Id}
        if (data.length === 0) {
            try {
                const resEx: any = await api.get('exam', `/exam_master/get_exam_list/${asmaY_Id}`);
                data = extractArray(resEx, 'examlist', 'getexam', 'exams', 'examList');
            } catch { }
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Error in getExamsDropDownByAcademicYearandClassandSectionlist:', error);
        return { success: false, message: error?.message || 'Failed to fetch exams', data: [] };
    }
}

// 🔹 Student Dropdown
export async function getStudentsDropDownByAcademicYearandClassandSectionlist(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    try {
        if (!asmaY_Id || !asmcL_Id || asmS_Id === undefined || asmS_Id === null) {
            return { success: false, message: 'Academic Year, Class, and Section ID are required', data: [] };
        }
        const url = `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}&ASMS_Id=${asmS_Id}`;
        console.info('url', url);
        const res = await api.get<IAcademicYearandClassandsection[]>('exam', url);
        return { success: res?.success ?? true, data: res?.data ?? [] };
    } catch (error: any) {
        console.error('Error in getStudentsDropDownByAcademicYearandClassandSectionlist:', error);
        return { success: false, message: error?.message || 'Failed to fetch students', data: [] };
    }
}

export async function getExamReportCard(data: any) {
    const url = '/individual_exam_report_card/exam_report_card';
    return await api.post<any>('exam', url, data);
}

export async function getExamsStjames(data: any) {
    const url = `/JSHSExamReportsFacade/get_exam_groups`;
    return await api.post<any>('exam', url, data);
}

export async function getStJamesExamReport(data: any) {
    const url = `/JSHSExamReportsFacade/st_james_exam_report`;
    return await api.post<any>('exam', url, data);
}

export async function getStJamesNurseryReport(data: any) {
    const url = `/JSHSExamReportsFacade/get_stjames_nur_report`;
    return await api.post<any>('exam', url, data);
}

export async function getStJamesTransitionReport(data: any) {
    const url = `/JSHSExamReportsFacade/st_james_nur_report`;
    return await api.post<any>('exam', url, data);
}

export async function getStJamesConsolidatedPointsReport(data: any) {
    const url = `/JSHSExamReportsFacade/stjames_exam_consolidated_report`;
    return await api.post<any>('exam', url, data);
}
