'use server';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';

/**
 * Initial load data: Academic Year, Class, Section, Subjects, Grid
 */
export async function fetchInitialData() {
    const url = '/IVRM_ClassWork/Getdetails';
    return await api.get<any>('portal', url);
}

/**
 * Fetch classes for a given academic year
 */
export async function fetchClasses(asmaY_Id: number, hrmE_Id: number) {
    const url = `/IVRM_ClassWork/get_classes?ASMAY_Id=${asmaY_Id}&HRME_Id=${hrmE_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Fetch sections for a given class and academic year
 */
export async function fetchSections(asmcL_Id: number, asmaY_Id: number) {
    const url = `/IVRM_ClassWork/getsectiondata?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Fetch subjects for a given class, academic year, and sections
 */
export async function fetchSubjects(asmcL_Id: number, asmaY_Id: number, hm_section_list: { asmS_Id: number }[] | any[]) {
    const url = '/IVRM_ClassWork/getsubject';
    const payload = {
        ASMAY_Id: asmaY_Id,
        ASMCL_Id: asmcL_Id,
        hm_section_list: hm_section_list.map((s: any) => ({
            ASMS_Id: s.asmS_Id || s.ASMS_Id
        }))
    };
    return await api.post<any>('portal', url, payload);
}

/**
 * Save or update classwork
 */
export async function saveClassWork(payload: any) {
    const url = '/IVRM_ClassWork/savedetail';
    const result = await api.post<any>('portal', url, payload);
    if (result.success) {
        revalidatePath('/upload/transactions/ivrm-classwork');
    }
    return result;
}

/**
 * Toggle active/inactive status
 */
export async function toggleClassWork(icW_Id: number) {
    const url = `/IVRM_ClassWork/deactivate?ICW_Id=${icW_Id}`;
    const result = await api.post<any>('portal', url, {});
    if (result.success) {
        revalidatePath('/upload/transactions/ivrm-classwork');
    }
    return result;
}

/**
 * Fetch classwork list based on filters
 */
export async function getClassWorkList(payload: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ISMS_Id: number;
    fromdate: string;
    todate: string;
}) {
    const url = `/IVRM_ClassWork/getclasswork_list?ASMAY_Id=${payload.ASMAY_Id}&ASMCL_Id=${payload.ASMCL_Id}&ASMS_Id=${payload.ASMS_Id}&ISMS_Id=${payload.ISMS_Id}&fromdate=${payload.fromdate}&todate=${payload.todate}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Fetch classwork topic list based on filters
 */
export async function getClassWorkTopicList(payload: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ISMS_Id: number;
    fromdate: string;
    todate: string;
}) {
    const url = `/IVRM_ClassWork/getclasswork_Topiclist?ASMAY_Id=${payload.ASMAY_Id}&ASMCL_Id=${payload.ASMCL_Id}&ASMS_Id=${payload.ASMS_Id}&ISMS_Id=${payload.ISMS_Id}&fromdate=${payload.fromdate}&todate=${payload.todate}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Fetch subject list based on filters (Used in Verify ClassWork)
 */
export async function SubjectsDropDownByAcademicYearandClassandSection(payload: { asmaY_Id: number; asmcL_Id: number; asmS_Id: number }) {
    const url = `/IVRM_ClassWork/getsubjectlist?ASMAY_Id=${payload.asmaY_Id}&ASMCL_Id=${payload.asmcL_Id}&ASMS_Id=${payload.asmS_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Fetch classwork details for editing (including attachments)
 */
export async function editClassWork(icW_Id: number, asmaY_Id: number) {
    const url = `/IVRM_ClassWork/editData?ICW_Id=${icW_Id}&ASMAY_Id=${asmaY_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * View classwork attachments
 */
export async function viewClassWorkAttachments(icW_Id: number) {
    const url = `/IVRM_ClassWork/viewData?ICW_Id=${icW_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Load student list for marks entry (Used in Marks Entry)
 */
export async function fetchClassWorkStudents(icW_Id: number) {
    const url = `/IVRM_ClassWork/getclasswork_student?ICW_Id=${icW_Id}`;
    return await api.post<any>('portal', url, {});
}

export async function fetchClassWorkStudentList(asmcL_Id: number, ASMS_Id: number, asmaY_Id: number) {
    const url = `/IVRM_ClassWork/getclasswork_student?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}&ASMS_Id=${ASMS_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Update classwork marks (Used in Marks Entry)
 */
export async function saveClassWorkMarks(payload: any) {
    const url = '/IVRM_ClassWork/classwork_marks_update';
    return await api.post<any>('portal', url, payload);
}

export async function updateClassWorkMarks(payload: any) {
    return await saveClassWorkMarks(payload);
}

/**
 * View student uploaded files
 */
export async function viewStudentUpload(AMST_Id: number, ICW_Id: number, ICWUPL_Id: number) {
    const url = '/IVRM_ClassWork/viewstudentupload';
    const payload = { AMST_Id, ICW_Id, ICWUPL_Id };
    return await api.post<any>('portal', url, payload);
}

/**
 * Edit classwork marks for a specific student
 */
export async function editClassWorkMark(icW_Id: number, AMST_Id: number) {
    const url = `/IVRM_ClassWork/edit_classwork_mark?ICW_Id=${icW_Id}&AMST_Id=${AMST_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * View general classwork details
 */
export async function viewClassWork(icW_Id: number) {
    const url = `/IVRM_ClassWork/viewclasswork?ICW_Id=${icW_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Staff upload for students (feedback/corrected files)
 */
export async function staffUpload(doclist: any[]) {
    const url = '/IVRM_ClassWork/stfupload';
    const payload = { doclist };
    return await api.post<any>('portal', url, payload);
}
