'use server';

import { api } from '@/lib/apiService';

export async function getSamarthaClasses(asmay_id: number) {
    try {
        const payload = { ASMAY_Id: asmay_id };
        let response = await api.post<any>('exam', '/JSHSExamReports_/get_classes', payload).catch(() => null);
        if (!response || (!response.success && !response.data)) {
            response = await api.post<any>('exam', '/JSHSExamReports/get_classes', payload).catch(() => null);
        }
        if (response && (response.success || response.data)) {
            return { success: true, data: response.data || response };
        }
        const resGet = await api
            .get<any>('exam', `/exam_master_category/class_drop_down_by_academic_year_list/${asmay_id}`)
            .catch(() => null);
        return { success: resGet?.success ?? true, data: resGet?.data ?? resGet };
    } catch {
        return { success: false, data: [] };
    }
}

export async function getSamarthaSections(asmay_id: number, asmcl_id: number) {
    try {
        const payload = { ASMAY_Id: asmay_id, ASMCL_Id: asmcl_id };
        let response = await api.post<any>('exam', '/JSHSExamReports_/get_sections', payload).catch(() => null);
        if (!response || (!response.success && !response.data)) {
            response = await api.post<any>('exam', '/JSHSExamReports/get_sections', payload).catch(() => null);
        }
        if (response && (response.success || response.data)) {
            return { success: true, data: response.data || response };
        }
        const resGet = await api
            .get<any>('exam', `/exam_master_category/sections_drop_down_by_class_list/${asmcl_id}/${asmay_id}`)
            .catch(() => null);
        return { success: resGet?.success ?? true, data: resGet?.data ?? resGet };
    } catch {
        return { success: false, data: [] };
    }
}

export async function getSamarthaStudents(asmay_id: number, asmcl_id: number, asms_id: number) {
    try {
        const payload = { ASMAY_Id: asmay_id, ASMCL_Id: asmcl_id, ASMS_Id: asms_id };
        let response = await api.post<any>('exam', '/JSHSExamReports_/GetStudentDetails', payload).catch(() => null);
        if (!response || (!response.success && !response.data)) {
            response = await api.post<any>('exam', '/JSHSExamReports/GetStudentDetails', payload).catch(() => null);
        }
        if (response && (response.success || response.data)) {
            return { success: true, data: response.data || response };
        }
        const resGet = await api
            .get<any>(
                'exam',
                `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmay_id}&ASMCL_Id=${asmcl_id}&ASMS_Id=${asms_id}`
            )
            .catch(() => null);
        return { success: resGet?.success ?? true, data: resGet?.data ?? resGet };
    } catch {
        return { success: false, data: [] };
    }
}

export async function getSamarthaProgressCardReportPromotion(data: any) {
    try {
        const studentArr = (data.studentList || data.temp_Amstids || data.Temp_AmstIds || []).map((s: any) => ({
            AMST_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s),
            amsT_Id: Number(s.amsT_Id ?? s.AMST_Id ?? s)
        }));

        const payload = {
            ASMAY_Id: Number(data.asmaY_Id ?? data.ASMAY_Id ?? 0),
            ASMCL_Id: Number(data.asmcL_Id ?? data.ASMCL_Id ?? 0),
            ASMS_Id: Number(data.asmS_Id ?? data.ASMS_Id ?? 0),
            studentlist: studentArr,
            Temp_AmstIds: studentArr
        };

        let response = await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload).catch(() => null);
        if (!response || (!response.success && !response.data)) {
            response = await api.post<any>('exam', '/JSHSExamReports/nds_9_report', payload).catch(() => null);
        }
        if (!response || (!response.success && !response.data)) {
            response = await api.post<any>('exam', '/JSHSExamReports_/nds_9_report', payload).catch(() => null);
        }

        if (response && (response.success || response.data)) {
            return { success: true, data: response.data || response };
        }
        return { success: false, message: response?.message || 'Failed to fetch report data' };
    } catch (error: any) {
        console.error('Error in getSamarthaProgressCardReportPromotion:', error);
        return { success: false, message: error?.message || 'An error occurred while fetching report data' };
    }
}
