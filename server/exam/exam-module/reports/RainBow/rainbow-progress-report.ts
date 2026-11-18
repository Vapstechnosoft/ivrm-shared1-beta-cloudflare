'use server';

import { api } from '@/lib/apiService';
import type { IMasterClassYearlyList } from '@/types/exam/exam-module/masters';
import type { IAcademicYearandClassandsection } from '@/types/exam/exam-module/report';

/**
 * Get Academic Year Dropdown
 */
export async function getExamAcademicYearDropdown() {
    const url = '/exam_master/get_academic_year_list';
    return await api.get<IMasterClassYearlyList[]>('exam', url);
}

/**
 * Get Class Dropdown by Academic Year
 */
// export async function getClassDropDownByAcademicYearlist(asmaY_Id: number) {
//     if (!asmaY_Id) throw new Error('Academic Year ID is required');
//     const url = `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}`;
//     return await api.get<IAcademicYearandClassandsection[]>('exam', url);
// }

export async function getClassDropDownByAcademicYearlist(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    const url = `/exam_master_category/class_drop_down_by_academic_year_list/${asmaY_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

/**
 * Get Sections by Academic Year and Class
 */
export async function getSectionsDropDownByAcademicYearandClasslist(asmcL_Id: number, asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    const url = `/exam_master_category/sections_drop_down_by_class_list/${asmcL_Id}/${asmaY_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

/**
 * Get Students by Academic Year, Class, and Section
 */
export async function getStudentsDropDownByAcademicYearandClassandSectionlist(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    if (!asmcL_Id) throw new Error('Class ID is required');
    if (!asmS_Id) throw new Error('Section ID is required');
    const url = `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}&ASMS_Id=${asmS_Id}`;
    return await api.get<IAcademicYearandClassandsection[]>('exam', url);
}

/**
 * Get RainBow Progress Card Report Data
 */
export async function getRainbowProgressCardReport(payload: any) {
    return await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
}

/**
 * Update Student Details (Save template)
 */
export async function updateStudentDetails(payload: any) {
    return await api.post<any>('exam', '/BaldwinAllReport/studentDetails', payload);
}
