'use server';

import { api } from '@/lib/apiService';

export async function getMasterQuestionBankLoadData(data: { pageid: number }) {
    const url = '/MasterQuestionBank/getacademicyear';
    try {
        const res = await api.post<any>('exam', url, data);
        return res?.data || res;
    } catch (error: any) {
        console.error('[Server] getMasterQuestionBankLoadData error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}

export async function getMasterQuestionBankSubjects(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = '/SlabWiseExamReport/getsubjects';
    try {
        const res = await api.post<any>('exam', url, data);
        return res?.data || res;
    } catch (error: any) {
        console.error('[Server] getMasterQuestionBankSubjects error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}

export async function saveMasterQuestionBank(payload: any) {
    const url = '/MasterQuestionBank/savequestionpaper';
    try {
        const res = await api.post<any>('exam', url, payload);
        return res?.data || res;
    } catch (error: any) {
        console.error('[Server] saveMasterQuestionBank error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}

export async function deleteMasterQuestionBank(payload: any) {
    const url = '/MasterQuestionBank/deletepaper';
    try {
        const res = await api.post<any>('exam', url, payload);
        return res?.data || res;
    } catch (error: any) {
        console.error('[Server] deleteMasterQuestionBank error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}

export async function searchMasterQuestionBankDocument(data: { searchparameter: string }) {
    const url = '/MasterQuestionBank/searchdocument';
    try {
        const res = await api.post<any>('exam', url, data);
        return res?.data || res;
    } catch (error: any) {
        console.error('[Server] searchMasterQuestionBankDocument error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}
