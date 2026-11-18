'use server';

import { api } from '@/lib/apiService';

/**
 * GeneralSendSMSSRKVS Controller
 * Ported from: GeneralSendSMSSRKVS.js
 */

export async function getGeneralSendSMSOnLoad() {
    try {
        const url = '/JSHSExamReports/Getdetails/2';
        return await api.get<any>('exam', url);
    } catch (error) {
        console.error('getGeneralSendSMSOnLoad error:', error);
        return { success: false, data: null };
    }
}

export async function getGeneralSendSMSClasses(asmaY_Id: number) {
    try {
        const url = '/JSHSExamReports/get_classes';
        return await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id });
    } catch (error) {
        console.error('getGeneralSendSMSClasses error:', error);
        return { success: false, data: null };
    }
}

export async function getGeneralSendSMSSections(asmaY_Id: number, asmcL_Id: number) {
    try {
        const url = '/JSHSExamReports/get_sections';
        return await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id });
    } catch (error) {
        console.error('getGeneralSendSMSSections error:', error);
        return { success: false, data: null };
    }
}

export async function getGeneralSendSMSExamsAndGrades(payload: any) {
    try {
        const url = '/JSHSExamReports/get_Exam_grade';
        return await api.post<any>('exam', url, payload);
    } catch (error) {
        console.error('getGeneralSendSMSExamsAndGrades error:', error);
        return { success: false, data: null };
    }
}

export async function getGeneralSendSMSStudentList(payload: any, isGradeWise: boolean) {
    try {
        const url = isGradeWise ? '/JSHSExamReports/getmultiple_exam_cumulative_report' : '/General_SendSMS/SrkvsSerach';
        const response = await api.post<any>('exam', url, payload);
        return response;
    } catch (error) {
        console.error('getGeneralSendSMSStudentList error:', error);
        return { success: false, data: null };
    }
}

export async function sendGeneralSMSAndEmail(payload: any) {
    try {
        const url = '/General_SendSMS/savedetail';
        return await api.post<any>('exam', url, payload);
    } catch (error) {
        console.error('sendGeneralSMSAndEmail error:', error);
        return { success: false, data: null };
    }
}
