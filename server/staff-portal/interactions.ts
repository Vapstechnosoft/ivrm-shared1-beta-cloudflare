'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import type {
    IFeedbackOption,
    IFeedbackQuestion,
    IInteractionsInitialData,
    ISaveInteractionRequest,
    ISaveReplyRequest,
    IThreadResponse
} from '@/types/staff-portal/interactions';

const BASE_URL = '/IVRM_Interactions';

export async function getInitialInteractions(): Promise<ApiResponse<IInteractionsInitialData>> {
    return await api.post<IInteractionsInitialData>('portal', `/IVRM_Interactions/getloaddata`, {});
}

export async function getRecipientsByRole(
    roleflg: string,
    userflag: string,
    asmay_Id: number
): Promise<ApiResponse<{ getdetails: any[]; configflag: any[] }>> {
    return await api.post('portal', `${BASE_URL}/getdetails?UserFlag=${userflag}&RoleFlag=${roleflg}&ASMAY_Id=${asmay_Id}`, {});
}

export async function getSectionsForInteraction(
    asmcL_Id: number,
    asmaY_Id: number,
    roleflg: string
): Promise<ApiResponse<{ sectionList: any[] }>> {
    return await api.post('portal', `${BASE_URL}/Getsection?asmclid=${asmcL_Id}`, {});
}

export async function getNDASectionsForInteraction(
    asmcL_Id: number,
    asmaY_Id: number,
    roleflg: string
): Promise<ApiResponse<{ sectionList: any[] }>> {
    return await api.post('portal', `${BASE_URL}/Getsection?asmclid=${asmcL_Id}`, {});
}

export async function getStudentsForInteraction(asmcL_Id: number, asmS_Id: number): Promise<ApiResponse<{ get_student: any[] }>> {
    return await api.post('portal', `${BASE_URL}/getstudent?asmclid=${asmcL_Id}&asmsid=${asmS_Id}`, {});
}

export async function saveInteraction(data: ISaveInteractionRequest): Promise<ApiResponse<{ returnval: boolean }>> {
    return await api.post('portal', `${BASE_URL}/savedetails`, data);
}

export async function saveInteractionData(data: any): Promise<ApiResponse<{ returnval: boolean }>> {
    try {
        return await api.post('portal', `${BASE_URL}/savedata`, data);
    } catch (error: any) {
        return { success: false, message: error.message || String(error), data: null };
    }
}

export async function saveInteractionReply(data: ISaveReplyRequest): Promise<ApiResponse<{ returnval: boolean }>> {
    return await api.post('portal', `${BASE_URL}/savereply`, data);
}

export async function saveInteractionReplyData(data: any): Promise<ApiResponse<{ returnval: boolean }>> {
    try {
        return await api.post('portal', `${BASE_URL}/savereplydata`, data);
    } catch (error: any) {
        return { success: false, message: error.message || String(error), data: null };
    }
}

export async function deleteInteraction(data: { ISMINT_Id: number; ISTINT_Id: number }): Promise<ApiResponse<{ returnval: boolean }>> {
    return await api.post('portal', `${BASE_URL}/deleteinboxmsg?ISMINT_Id=${data.ISMINT_Id}`, {});
}

export async function deleteInteractionReply(ISTINT_Id: number): Promise<ApiResponse<{ returnval: boolean }>> {
    return await api.post('portal', `${BASE_URL}/deletemsg?ISTINT_Id=${ISTINT_Id}`, {});
}

export async function fetchThread(ISMINT_Id: number): Promise<ApiResponse<IThreadResponse>> {
    return await api.post('portal', `${BASE_URL}/reply?ISMINT_Id=${ISMINT_Id}`, {});
}

export async function markMessageAsRead(ISTINT_Id: number): Promise<ApiResponse<{ returnval: boolean }>> {
    return await api.post('portal', `${BASE_URL}/seen?ISTINT_Id=${ISTINT_Id}`, {});
}

export async function loadFeedbackQuestions(
    flag: string
): Promise<ApiResponse<{ feedbackquestion: IFeedbackQuestion[]; feedbackoption: IFeedbackOption[] }>> {
    return await api.post('portal', `${BASE_URL}/loadfeedbackquestion?Flag=${flag}`, {});
}

export async function saveFeedback(data: { savemodulefeedback: any[]; Flag: string; HRME_Id: number }): Promise<
    ApiResponse<{ returnval: boolean }>
> {
    return await api.post('portal', `${BASE_URL}/modulewisefeedback`, data);
}
