'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

// ==========================================
// SUBJECTIVE ANSWER PAPER CORRECTION
// ==========================================

export async function getCorrectionLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/LP_OnlineStudentExam/getloaddatareport/2?${urlParams}`;
    return await api.get<any>('exam', url);
}

export async function getStudentsForCorrection(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    ismS_Id: number;
    lmsmoE_Id: number;
}) {
    const url = '/LP_OnlineStudentExam/GetSearchDetails';
    return await api.post<any>('exam', url, data);
}

export async function getStudentSubjectiveQuestionPaper(data: {
    amsT_Id: number;
    lmsmoE_Id: number;
}) {
    const url = '/LP_OnlineStudentExam/ViewQuestion';
    return await api.post<any>('exam', url, data);
}

export async function saveSubjectiveEvaluationMarks(data: {
    amsT_Id: number;
    lmsmoE_Id: number;
    evaluatedAnswers: {
        lmsmQ_Id: number;
        marksAwarded: number;
        staffRemarks?: string;
    }[];
}) {
    const url = '/LP_OnlineStudentExam/SaveSubjectiveMarks';
    return await api.post<any>('exam', url, data);
}

// ==========================================
// PUBLISH TO STUDENT PORTAL
// ==========================================

export async function getStudentsForPublish(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    ismS_Id: number;
    lmsmoE_Id: number;
}) {
    const url = '/LP_OnlineStudentExam/GetStudentListForPublish';
    return await api.post<any>('exam', url, data);
}

export async function checkStudentMarksEntered(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    ismS_Id: number;
    lmsmoE_Id: number;
}) {
    const url = '/LP_OnlineStudentExam/CheckStudentMarksEntered';
    return await api.post<any>('exam', url, data);
}

export async function publishMarksToStudent(data: {
    lmsmoE_Id: number;
    studentIds: number[];
    sendSMSNotification?: boolean;
    sendEmailNotification?: boolean;
}) {
    const url = '/LP_OnlineStudentExam/PublishToStudent';
    return await api.post<any>('exam', url, data);
}

// ==========================================
// ONLINE EXAM MARKS TO MASTER EXAM TRANSFER
// ==========================================

export async function getExamOEStudentList(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    ismS_Id: number;
    emE_Id: number;
    lmsmoE_Id: number;
}) {
    const url = '/LP_OnlineStudentExam/GetExam_OE_StudentList';
    return await api.post<any>('exam', url, data);
}

export async function saveOEMarksToMasterExam(data: any) {
    const url = '/LP_OnlineStudentExam/SaveOE_Marks_ME';
    return await api.post<any>('exam', url, data);
}
