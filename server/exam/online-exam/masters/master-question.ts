'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';

async function getMiId(id?: any) {
    if (id) return Number(id);
    const session = await auth();
    return Number(session?.mi_id || 4);
}

export async function getMasterQuestionInitialData(searchParams?: ApiSearchparams) {
    const miId = await getMiId(searchParams?.MI_Id);
    const urlParams = getSearchParamsUrl(searchParams ?? {});

    // 1. Try MasterQuestionFacade/getloaddata
    try {
        const res: any = await api.post('exam', '/MasterQuestionFacade/getloaddata', { MI_Id: miId, mi_id: miId });
        const data = res?.data || res;
        if (data && (data.getClass || data.getclass || data.getclasslist || data.getSubjects || data.getsubjectlist || data.getQuestiondetails || data.questionList || data.getMasterQuestiondetails)) {
            return data;
        }
    } catch (e) {}

    // 2. Try LP_OnlineExam/getmasterquestionloaddata
    try {
        const res: any = await api.post('exam', '/LP_OnlineExam/getmasterquestionloaddata', { MI_Id: miId, mi_id: miId });
        const data = res?.data || res;
        if (data && (data.getClass || data.getclass || data.getclasslist || data.getSubjects || data.getsubjectlist || data.getQuestiondetails || data.questionList || data.getMasterQuestiondetails)) {
            return data;
        }
    } catch (e) {}

    // 3. Try OnlineExam_MasterQuestion/loaddata
    let initialRes: any = null;
    let listRes: any = null;

    try {
        initialRes = await api.get<any>('exam', `/OnlineExam_MasterQuestion/getloaddata?${urlParams}`);
    } catch (e) {}

    try {
        listRes = await api.get<any>('exam', `/OnlineExam_MasterQuestion?${urlParams}`);
    } catch (e) {}

    const initialData = initialRes?.data || initialRes || {};
    const questionsArray = listRes?.data || listRes || [];

    return {
        ...(typeof initialData === 'object' ? initialData : {}),
        questionList: Array.isArray(questionsArray) ? questionsArray : (questionsArray?.$values || questionsArray?.data || [])
    };
}







export async function getMasterQuestionList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    return await api.get<any>('exam', `/OnlineExam_MasterQuestion?${urlParams}`);
}

export async function saveMasterQuestion(data: any) {
    try {
        const res: any = await api.post('exam', '/LP_OnlineExam/SaveMasterQuestionDetails', data);
        if (res && (res.message || res.returnval !== undefined || res.data)) {
            return res.data || res;
        }
    } catch (e: any) {
        console.warn('[saveMasterQuestion] fallback from LP_OnlineExam:', e?.message);
    }
    return await api.post<any>('exam', '/OnlineExam_MasterQuestion/savedetails', data);
}

export async function saveClassQuestionMapping(data: any) {
    return await api.post<any>('exam', '/OnlineExam_MasterQuestion/savedataclass', data);
}

export async function saveQuestionOptions(data: any) {
    return await api.post<any>('exam', '/OnlineExam_MasterQuestion/savedetails1', data);
}

export async function getQuestionOptions(id: number) {
    try {
        const res: any = await api.post('exam', '/LP_OnlineExam/EditMasterQuestion', { LPMOEQ_Id: id });
        const data = res?.data || res;
        if (data?.getSavedOptions || data?.getViewSavedOptions) {
            const saved = data.getSavedOptions || data.getViewSavedOptions || [];
            const files = data.getViewSavedOptionsFiles || [];
            return (saved || []).map((opt: any) => ({
                LPMOEQOA_Id: opt.lpmoeqoA_Id || opt.LPMOEQOA_Id || 0,
                lmsmoeqoA_Id: opt.lpmoeqoA_Id || opt.LPMOEQOA_Id || 0,
                LPMOEQOA_Option: opt.lpmoeqoA_Option || opt.LPMOEQOA_Option || '',
                lmsmoeqoA_Option: opt.lpmoeqoA_Option || opt.LPMOEQOA_Option || '',
                LPMOEQOA_OptionCode: opt.lpmoeqoA_OptionCode || opt.LPMOEQOA_OptionCode || '',
                lmsmoeqoA_OptionCode: opt.lpmoeqoA_OptionCode || opt.LPMOEQOA_OptionCode || '',
                LPMOEQOA_AnswerFlag: Boolean(opt.lpmoeqoA_AnswerFlag ?? opt.LPMOEQOA_AnswerFlag),
                lmsmoeqoA_AnswerFlag: Boolean(opt.lpmoeqoA_AnswerFlag ?? opt.LPMOEQOA_AnswerFlag),
                files: (files || []).filter((f: any) => f.lpmoeqoA_Id === (opt.lpmoeqoA_Id || opt.LPMOEQOA_Id))
            }));
        }
        if (data && Array.isArray(data)) return data;
    } catch (e: any) {
        console.warn('[getQuestionOptions] fallback from LP_OnlineExam:', e?.message);
    }
    return await api.get<any>('exam', `/OnlineExam_MasterQuestion/editQuestion/${id}`);
}

export async function toggleMasterQuestion(id: number) {
    return await api.put<any>('exam', `/OnlineExam_MasterQuestion/deactiveparticulars/${id}`, {});
}

export async function deleteMasterQuestion(id: number) {
    return await api.delete<any>('exam', `/OnlineExam_MasterQuestion/Deletedetails/${id}`);
}












