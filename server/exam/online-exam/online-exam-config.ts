'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterOEExam, IOnlineExamConfig } from '@/types/exam/online-exam';

// ==========================================
// STANDARD ONLINE EXAM CONFIGURATION
// ==========================================

export async function getOnlineExamConfigLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/OnlineExamConfig/getloaddata/2?${urlParams}`;
    return await api.get<any>('exam', url);
}

export async function saveOnlineExamConfig(data: IOnlineExamConfig | any) {
    const url = '/OnlineExamConfig/savedata';
    return await api.post<any>('exam', url, data);
}

export async function editOnlineExamConfig(data: { lmsmoecfG_Id?: number; paoecfG_Id?: number }) {
    const url = '/OnlineExamConfig/editQuestion';
    return await api.post<any>('exam', url, data);
}

export async function deleteOnlineExamConfig(data: { lmsmoecfG_Id?: number; paoecfG_Id?: number }) {
    const url = '/OnlineExamConfig/Deletedetails';
    return await api.post<any>('exam', url, data);
}

// ==========================================
// MASTER OE EXAM (ADVANCED LEVEL EXAM SETUP)
// ==========================================

export async function getMasterOEExamLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/LP_OnlineExam/getexammasterload/2?${urlParams}`;
    return await api.get<any>('exam', url);
}

export async function getExamClassList(data: { asmaY_Id: number }) {
    const url = '/LP_OnlineExam/getexamclasslist';
    return await api.post<any>('exam', url, data);
}

export async function getExamSectionsList(data: { asmaY_Id: number; asmcL_Id: number }) {
    const url = '/LP_OnlineExam/getexamsectionslist';
    return await api.post<any>('exam', url, data);
}

export async function getExamSubjectList(data: { asmaY_Id: number; asmcL_Id: number }) {
    const url = '/LP_OnlineExam/getexamsubjectlist';
    return await api.post<any>('exam', url, data);
}

export async function searchQuestionsForExam(data: any) {
    const url = '/LP_OnlineExam/SearchQuestions';
    return await api.post<any>('exam', url, data);
}

export async function saveMasterOEExam(data: IMasterOEExam | any) {
    const url = '/LP_OnlineExam/SaveMasterExamQuestionDetails';
    return await api.post<any>('exam', url, data);
}

export async function toggleMasterOEExam(data: { lmsmoE_Id: number }) {
    const url = '/LP_OnlineExam/DeactivateActivateMasterExam';
    return await api.post<any>('exam', url, data);
}

export async function viewMasterOEExamPaper(data: { lmsmoE_Id: number }) {
    const url = '/LP_OnlineExam/ViewQuestionPaper';
    return await api.post<any>('exam', url, data);
}
