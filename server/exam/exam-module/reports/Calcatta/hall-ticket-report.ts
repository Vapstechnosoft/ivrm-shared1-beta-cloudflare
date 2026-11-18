'use server';

import { api } from '@/lib/apiService';

// ─── Dropdown: classes by academic year ───────────────────────────────────────
export async function getClassesByAcademicYear(ASMAY_Id: number) {
    if (!ASMAY_Id) throw new Error('Academic Year ID is required');
    const url = `/exam_master_category/class_drop_down_by_academic_year_list/${ASMAY_Id}`;
    return await api.get<any[]>('exam', url);
}

// ─── Dropdown: sections by year + class ───────────────────────────────────────
export async function getSectionsByYearAndClass(ASMAY_Id: number, ASMCL_Id: number) {
    if (!ASMAY_Id) throw new Error('Academic Year ID is required');
    if (!ASMCL_Id) throw new Error('Class ID is required');
    const url = `/exam_master_category/sections_drop_down_by_class_list/${ASMCL_Id}/${ASMAY_Id}`;
    return await api.get<any[]>('exam', url);
}

// ─── Dropdown: exams + students by year + class + section ─────────────────────
export async function getExamsAndStudentsBySection(ASMAY_Id: number, ASMCL_Id: number, ASMS_Id: number) {
    if (!ASMAY_Id) throw new Error('Academic Year ID is required');
    if (!ASMCL_Id) throw new Error('Class ID is required');
    if (!ASMS_Id) throw new Error('Section ID is required');

    // Exams dropdown
    const examUrl = `/exam_master/exam_drop_down_by_year_class_section_list/${ASMAY_Id}/${ASMCL_Id}/${ASMS_Id}`;
    const examRes = await api.get<any[]>('exam', examUrl);

    // Students dropdown
    const studentUrl = `/exam_master_category/students_drop_down_by_year_class_section_list?ASMAY_Id=${ASMAY_Id}&ASMCL_Id=${ASMCL_Id}&ASMS_Id=${ASMS_Id}`;
    const studentRes = await api.get<any[]>('exam', studentUrl);

    return {
        examlist: examRes.data ?? [],
        studentlist: studentRes.data ?? []
    };
}

// ─── Generate Hall Ticket Report ──────────────────────────────────────────────
// export async function getHallTicketReport(data: {
//     ASMAY_Id: number;
//     ASMCL_Id: number;
//     ASMS_Id: number;
//     EME_Id: number;
//     studentlist: { amsT_Id: number }[];
// }) {
//     const url = '/VikasaHallTicketReportFacade/hall_ticket_report';
//     const response = await api.post<any>('exam', url, data);
//     return response;
// }

export async function getHallTicketReport(data: any) {
    const url = '/VikasaHallTicketReportFacade/hall_ticket_report';
    return await api.post<any>('exam', url, data);
}
