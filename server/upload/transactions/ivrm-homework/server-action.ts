'use server';

import { api } from '@/lib/apiService';
import type { IHomeWork, IHomeWorkMarksSearch } from '@/schemas/upload/transactions/ivrm-homework.schema';
import { revalidatePath } from 'next/cache';

/**
 * Initial load data: Academic Year, Class, Section, Subjects, Grid
 */
export async function fetchInitialData() {
    const url = '/EmployeeStudentHomework/Getdetails';
    return await api.get<any>('portal', url);
}

/**
 * Fetch classes for a given academic year
 */
export async function fetchClasses(asmaY_Id: number, hrmE_Id: number) {
    const url = `/EmployeeStudentHomework/get_classes?ASMAY_Id=${asmaY_Id}&HRME_Id=${hrmE_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Fetch sections for a given class and academic year
 */
export async function fetchSections(asmcL_Id: number, asmaY_Id: number) {
    const url = `/EmployeeStudentHomework/getsectiondata?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Fetch subjects for a given class, academic year, and sections (Multi-select)
 */
export async function fetchSubjects(asmcL_Id: number, asmaY_Id: number, hm_section_list: { asmS_Id: number }[]) {
    const url = '/EmployeeStudentHomework/getsubject';
    const mappedPayload = {
        ASMAY_Id: asmaY_Id,
        ASMCL_Id: asmcL_Id,
        hm_section_list: hm_section_list.map((s) => ({
            ASMS_Id: s.asmS_Id
        }))
    };
    return await api.post<any>('portal', url, mappedPayload);
}

/**
 * Fetch subject list for a single class and section (GET/Query params version)
 */
export async function fetchHomeworkSubjectList(asmaY_Id: number, asmcL_Id: number, asmS_Id: number) {
    const url = `/EmployeeStudentHomework/getsubjectlist?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}&ASMS_Id=${asmS_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Save or update homework
 */
export async function saveHomeWork(payload: IHomeWork) {
    const url = '/EmployeeStudentHomework/savedetail';

    // Map camelCase payload to PascalCase required by the backend API
    const mappedPayload = {
        IHW_Id: payload.ihW_Id || 0,
        ASMAY_Id: payload.asmaY_Id,
        IHW_AssignmentNo: payload.ihW_AssignmentNo || '1',
        ISMS_Id: payload.ismS_Id,
        ASMCL_Id: payload.asmcL_Id,
        IHW_Date: payload.ihW_Date,
        IHW_Topic: payload.ihW_Topic,
        IHW_Assignment: payload.ihW_Assignment || '',
        IHW_Attachment: '', // User example requested empty string if no single attachment
        hm_section_list: payload.hm_section_list.map((s) => ({
            ASMS_Id: s.asmS_Id
        })),
        IHW_FilePath_Array:
            payload.ihW_FilePath_Array?.map((f) => ({
                IHW_FilePath: f.ihW_FilePath,
                fileName: f.fileName
            })) || []
    };

    const result = await api.post<any>('portal', url, mappedPayload);
    if (result.success) {
        revalidatePath('/StaffPortal/Upload/ivrm-homework');
    }
    return result;
}

/**
 * Toggle active/inactive status
 */
export async function toggleHomeWork(payload: { ihW_Id: number }) {
    const url = `/EmployeeStudentHomework/deactivate?IHW_Id=${payload.ihW_Id}`;
    const result = await api.post<any>('portal', url, {});
    if (result.success) {
        revalidatePath('/StaffPortal/Upload/ivrm-homework');
    }
    return result;
}

/**
 * Fetch homework details for editing (including attachments)
 */
export async function editHomeWork(ihW_Id: number, asmaY_Id: number) {
    const url = `/EmployeeStudentHomework/editData?IHW_Id=${ihW_Id}&ASMAY_Id=${asmaY_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * View homework attachments
 */
export async function viewHomeWorkAttachments(ihW_Id: number) {
    const url = `/EmployeeStudentHomework/viewData?IHW_Id=${ihW_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * View general homework details
 */
export async function viewHomeWorkDetail(ihW_Id: number) {
    const url = `/EmployeeStudentHomework/viewhomework?IHW_Id=${ihW_Id}`;
    return await api.post<any>('portal', url, {});
}

// --- Marks Entry Section (from legacy code) ---

/**
 * Load student marks list for a given homework
 */
export async function fetchHomeWorkMarksList(payload: IHomeWorkMarksSearch) {
    const fromDate = payload.from_date?.toISOString().split('T')[0] || '';
    const toDate = payload.to_date?.toISOString().split('T')[0] || '';

    const url = `/EmployeeStudentHomework/gethomework_list?ASMAY_Id=${payload.asmaY_Id}&ASMCL_Id=${payload.asmcL_Id}&ASMS_Id=${payload.asmS_Id}&ISMS_Id=${payload.ismS_Id || 0}&fromdate=${fromDate}&todate=${toDate}`;

    return await api.post<any>('portal', url, {});
}

/**
 * Fetch homework topics based on filters
 */
export async function fetchHomeworkTopics(payload: IHomeWorkMarksSearch) {
    const fromDate = payload.from_date?.toISOString().split('T')[0] || '';
    const toDate = payload.to_date?.toISOString().split('T')[0] || '';

    const url = `/EmployeeStudentHomework/gethomework_listTopic?ASMAY_Id=${payload.asmaY_Id}&ASMCL_Id=${payload.asmcL_Id}&ASMS_Id=${payload.asmS_Id}&ISMS_Id=${payload.ismS_Id || 0}&fromdate=${fromDate}&todate=${toDate}`;

    return await api.post<any>('portal', url, {});
}

/**
 * Update homework marks for multiple students
 */
export async function updateHomeWorkMarks(payload: { ihW_Id: number; students: any[] }) {
    const url = '/EmployeeStudentHomework/homework_marks_update';

    // Map payload to the structure expected by the backend
    const mappedPayload = {
        gethomework_list_array: payload.students.map((s) => ({
            IHW_Id: payload.ihW_Id,
            AMST_Id: s.amst_Id || s.AMST_Id,
            IHWUPL_Id: s.ihwupl_Id || 0,
            Marks: Number(s.ihwupl_Marks) || 0,
            IHWUPL_StaffRemarks: s.ihwupl_StaffRemarks || '',
            IHWUPL_StaffUpload: s.ihwupl_StaffUpload || '',
            IHWUPL_FileName: s.ihwupl_FileName || ''
        }))
    };

    const result = await api.post<any>('portal', url, mappedPayload);
    return result;
}

/**
 * Fetch existing marks and details for a single student homework
 */
export async function fetchStudentHomeworkMark(ihW_Id: number, amst_Id: number) {
    const url = `/EmployeeStudentHomework/edit_homework_mark?IHW_Id=${ihW_Id}&AMST_Id=${amst_Id}`;
    return await api.post<any>('portal', url, {});
}

/**
 * Upload staff feedback documents for student homework
 */
export async function uploadStaffHomeworkDocument(payload: {
    ihwupl_Id: number;
    filePath: string;
    fileName: string;
    remarks: string;
}) {
    const url = '/EmployeeStudentHomework/stfupload';
    const mappedPayload = {
        doclist: [
            {
                IHWUPL_Id: payload.ihwupl_Id,
                FilePath1: payload.filePath,
                FileName1: payload.fileName,
                Remarks: payload.remarks
            }
        ]
    };
    return await api.post<any>('portal', url, mappedPayload);
}
export async function fetchStudentUploadedHomework(AMST_Id: number, ihW_Id: number, IHWUPL_Id: number) {
    const url = `/EmployeeStudentHomework/viewstudentupload?IHW_Id=${ihW_Id}&AMST_Id=${AMST_Id}&IHWUPL_Id=${IHWUPL_Id}`;
    return await api.post<any>('portal', url, {});
}
