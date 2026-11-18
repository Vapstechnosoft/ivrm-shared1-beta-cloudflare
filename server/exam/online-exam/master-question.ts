'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IMasterComplexity,
    IMasterQuestion,
    IMasterQuestionCollege
} from '@/types/exam/online-exam';

// ==========================================
// SCHOOL MASTER QUESTION BANK
// ==========================================

export async function getMasterQuestionLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/OnlineExam_MasterQuestion/getloaddata?${urlParams}`;
    return await api.get<any>('exam', url);
}


export async function getClassListByYear(data: { asmaY_Id: number }) {
    const url = '/LP_OnlineExam/getclasslist';
    return await api.post<any>('exam', url, data);
}

export async function getSubjectListByClass(data: { asmaY_Id: number; asmcL_Id: number }) {
    const url = '/LP_OnlineExam/getsubjectlist';
    return await api.post<any>('exam', url, data);
}

export async function getTopicListBySubject(data: { ismS_Id: number }) {
    const url = '/LP_OnlineExam/gettopiclist';
    return await api.post<any>('exam', url, data);
}

export async function saveMasterQuestion(data: IMasterQuestion | any) {
    const url = '/LP_OnlineExam/SaveMasterQuestionDetails';
    return await api.post<any>('exam', url, data);
}

export async function editMasterQuestion(data: { lmsmQ_Id: number }) {
    const url = '/LP_OnlineExam/EditMasterQuestion';
    return await api.post<any>('exam', url, data);
}

export async function toggleMasterQuestion(data: { lmsmQ_Id: number }) {
    const url = '/LP_OnlineExam/DeactivateActivateQuestion';
    return await api.post<any>('exam', url, data);
}

export async function viewMasterQuestionOptions(data: { lmsmQ_Id: number }) {
    const url = '/LP_OnlineExam/ViewMasterQuesOptions';
    return await api.post<any>('exam', url, data);
}

export async function viewMasterQuestionDocs(data: { lmsmQ_Id: number }) {
    const url = '/LP_OnlineExam/ViewMasterQuesDoc';
    return await api.post<any>('exam', url, data);
}

// ==========================================
// COLLEGE MASTER QUESTION BANK
// ==========================================

export async function getMasterQuestionCollegeLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterQuestionCollege/getloaddata/2?${urlParams}`;
    return await api.get<any>('exam', url);
}

export async function getBranchByCourse(data: { amcO_Id: number }) {
    const url = '/MasterQuestionCollege/selectcourse';
    return await api.post<any>('exam', url, data);
}

export async function getSemByBranch(data: { amcO_Id: number; amB_Id: number }) {
    const url = '/MasterQuestionCollege/selectbran';
    return await api.post<any>('exam', url, data);
}

export async function saveMasterQuestionCollege(data: IMasterQuestionCollege | any) {
    const url = '/MasterQuestionCollege/savedetails';
    return await api.post<any>('exam', url, data);
}

// ==========================================
// COMPLEXITY MASTERS
// ==========================================

export async function getMasterComplexityList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/LP_OnlineExam/getmastercompliexities/2?${urlParams}`;
    return await api.get<any>('exam', url);
}

export async function saveMasterComplexity(data: IMasterComplexity | any) {
    const url = '/LP_OnlineExam/SaveMasterComplexity';
    return await api.post<any>('exam', url, data);
}

export async function toggleMasterComplexity(data: { lmsmcO_Id: number }) {
    const url = '/LP_OnlineExam/DeactivateActivateComplexities';
    return await api.post<any>('exam', url, data);
}

// ==========================================
// QUESTION DEACTIVATION & REPORTS
// ==========================================

export async function getDeactivateLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/LP_OnlineExam/loaddatadeactivate/2?${urlParams}`;
    return await api.get<any>('exam', url);
}

export async function getQuestionsForDeactivation(data: any) {
    const url = '/LP_OnlineExam/GetQuestionList';
    return await api.post<any>('exam', url, data);
}

export async function saveBatchDeactivateQuestions(data: any) {
    const url = '/LP_OnlineExam/SaveDeactiveQuestionDetails';
    return await api.post<any>('exam', url, data);
}

export async function getQuestionBankReportData(data: any) {
    const url = '/LP_OnlineExam/GetReport';
    return await api.post<any>('exam', url, data);
}
