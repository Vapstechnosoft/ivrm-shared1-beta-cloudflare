'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

// ==========================================
// STUDENT ONLINE EXAM TAKING PORTAL
// ==========================================

export async function getStudentExamLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/LP_OnlineStudentExam/getloaddata/2?${urlParams}`;
    return await api.get<any>('exam', url);
}

export async function onSelectSubjectForExam(data: { ismS_Id: number; asmaY_Id?: number }) {
    const url = '/LP_OnlineStudentExam/onselectsubject';
    return await api.post<any>('exam', url, data);
}

export async function getExamQuestionsForStudent(data: {
    lmsmoE_Id?: number;
    ismS_Id?: number;
    asmcL_Id?: number;
}) {
    const url = '/LP_OnlineStudentExam/getQuestion';
    return await api.post<any>('exam', url, data);
}

export async function saveStudentAnswer(data: {
    lmsmQ_Id: number;
    lmsmoP_Id?: number | null;
    selectedOptionIds?: number[];
    answerText?: string;
    answerFile?: string;
    remainingTime?: number;
}) {
    const url = '/LP_OnlineStudentExam/Saveanswer';
    return await api.post<any>('exam', url, data);
}

export async function getSavedAnswersForStudent(data?: any) {
    const url = '/LP_OnlineStudentExam/savedanswers';
    return await api.post<any>('exam', url, data ?? {});
}

export async function submitStudentExam(data: {
    lmsmoE_Id?: number;
    ismS_Id?: number;
    answersList?: any[];
}) {
    const url = '/LP_OnlineStudentExam/submitexam';
    return await api.post<any>('exam', url, data);
}

export async function getStudentExamScoreResult(data: { lmsmoE_Id?: number }) {
    const url = '/LP_OnlineStudentExam/GetViewMarks';
    return await api.post<any>('exam', url, data);
}

// College student exam
export async function getCollegeStudentExamLoadData() {
    const url = '/OnlineExamCollege/getloaddata/2';
    return await api.get<any>('exam', url);
}
