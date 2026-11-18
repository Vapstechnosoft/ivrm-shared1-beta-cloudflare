'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

// ==========================================
// PRE-ADMISSION QUESTION MASTER
// ==========================================

export async function getPAMasterQuestionLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/PAMasterQuestion/getloaddata/2?${urlParams}`;
    return await api.get<any>('preadmission', url);
}

export async function savePAMasterQuestion(data: any) {
    const url = '/PAMasterQuestion/savedetails';
    return await api.post<any>('preadmission', url, data);
}

export async function editPAMasterQuestion(data: any) {
    const url = '/PAMasterQuestion/editQuestion';
    return await api.post<any>('preadmission', url, data);
}

export async function togglePAMasterQuestion(data: any) {
    const url = '/PAMasterQuestion/deactiveparticulars';
    return await api.post<any>('preadmission', url, data);
}

// ==========================================
// PRE-ADMISSION ONLINE EXAM CONFIG
// ==========================================

export async function getPAOnlineExamConfigLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/PAOnlineExamConfig/getloaddata/2?${urlParams}`;
    return await api.get<any>('preadmission', url);
}

export async function savePAOnlineExamConfig(data: any) {
    const url = '/PAOnlineExamConfig/savedata';
    return await api.post<any>('preadmission', url, data);
}

export async function deletePAOnlineExamConfig(data: any) {
    const url = '/PAOnlineExamConfig/Deletedetails';
    return await api.post<any>('preadmission', url, data);
}

// ==========================================
// PRE-ADMISSION ONLINE EXAM TAKING & REPORT
// ==========================================

export async function getPAOnlineExamStudentLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/PAOnlineExam/getloaddata/2?${urlParams}`;
    return await api.get<any>('preadmission', url);
}

export async function getPAExamQuestions(data: any) {
    const url = '/PAOnlineExam/getQuestion';
    return await api.post<any>('preadmission', url, data);
}

export async function savePAAnswer(data: any) {
    const url = '/PAOnlineExam/Saveanswer';
    return await api.post<any>('preadmission', url, data);
}

export async function submitPAExam(data: any) {
    const url = '/PAOnlineExam/submitexam';
    return await api.post<any>('preadmission', url, data);
}

export async function getPAOnlineExamReport(data: any) {
    const url = '/PAOnlineExamConfig/getreport';
    return await api.post<any>('preadmission', url, data);
}
