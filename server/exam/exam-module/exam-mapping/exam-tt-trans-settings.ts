'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamTTTransSettings } from '@/types/exam/exam-module/exam-mapping';

// -------------------------------------------------------
// Get grid list
// -------------------------------------------------------
export async function getExamTTTransSettingsList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_TT_Transaction_Settings/exam_tt_transaction_grid_list?${urlParams}`;
    return await api.get<IExamTTTransSettings[]>('exam', url);
}
// -------------------------------------------------------
// Cascade: Get subject groups + exams by section + class + year
// -------------------------------------------------------
export async function getSubjectGroupsAndExamsBySection(ASMS_Id: number, ASMCL_Id: number, ASMAY_Id: number) {
    const url = 'exam_TT_Transaction_Settings/getSubjectGroupsAndExams';
    return await api.post<any>('exam', url, { ASMS_Id, ASMCL_Id, ASMAY_Id });
}

// -------------------------------------------------------
// Get subject list for grid + time slots on subject group select
// -------------------------------------------------------
export async function getSubjectListAndTimeSlots(params: {
    ASMS_Id: number;
    ASMCL_Id: number;
    ASMAY_Id: number;
    EMG_Id: number;
    EME_Id: number;
}) {
    const url = 'exam_TT_Transaction_Settings/onselectSubjects';
    return await api.post<any>('exam', url, params);
}

// -------------------------------------------------------
// Save exam timetable trans settings
// -------------------------------------------------------
export async function saveExamTTTransSettings(data: any) {
    const url = 'exam_TT_Transaction_Settings/save_exam_tt_transaction_settings';
    return await api.post<any>('exam', url, data);
}

// -------------------------------------------------------
// Get view records popup by extT_Id
// -------------------------------------------------------
export async function getExamTTTransViewRecords(extT_Id: number) {
    const url = `exam_TT_Transaction_Settings/view_exam_transaction_list/${extT_Id}`;
    return await api.get<any>('exam', url);
}

// -------------------------------------------------------
// Toggle active/deactive
// -------------------------------------------------------
export async function toggleExamTTTransRecord(EXTTS_Id: number) {
    const url = `exam_TT_Transaction_Settings/activate_or_deactivate/${EXTTS_Id}`;
    return await api.put<any>('exam', url);
}
// -------------------------------------------------------
// Get edit details by extT_Id
// -------------------------------------------------------
export async function getExamTTTransEditDetails(extT_Id: number) {
    const url = `exam_TT_Transaction_Settings/editgetdetails/${extT_Id}`;
    return await api.get<any>('exam', url);
}
