'use server';

import { api } from '@/lib/apiService';

/**
 * Get details to bind year list and grade list.
 */
export async function getHHSIIVDetails() {
    const url = '/HHSAllReport/Getdetails';
    return await api.get<any>('exam', url);
}

/**
 * Get class list by academic year.
 */
export async function getClassesByYear(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    const url = '/ExamCalculation_SSSE/get_classes';
    return await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id });
}

/**
 * Get section list by class and academic year.
 */
export async function getSectionsByClass(data: { ASMCL_Id: number; ASMAY_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    const url = '/ExamCalculation_SSSE/get_cls_sections';
    return await api.post<any>('exam', url, data);
}

/**
 * Get students by section.
 */
export async function getStudentsBySection(data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    if (!data.ASMS_Id) throw new Error('Section ID is required');
    const url = '/HHSAllReport/sectionchange';
    return await api.post<any>('exam', url, data);
}

/**
 * Save / generate report details.
 */
export async function getHHSIIVSaveDetails(data: any) {
    try {
        const url = '/HutchingReports/hhsallsavedetails';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch (error) {
        console.error('getHHSIIVSaveDetails error:', error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}
