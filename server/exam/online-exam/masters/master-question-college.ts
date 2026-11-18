'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IQuestionOption } from '@/types/exam/online-exam/masters';

export async function getMasterQuestionCollegeInitialData(searchParams?: ApiSearchparams) {
    return await api.get<any>('exam', `/MasterQuestionCollege/getloaddata?${getSearchParamsUrl(searchParams ?? {})}`);
}

export async function saveMasterQuestionCollege(data: any) {
    return await api.post<any>('exam', '/MasterQuestionCollege/savedetails', data);
}

export async function saveBranchQuestionMapping(data: any) {
    return await api.post<any>('exam', '/MasterQuestionCollege/savedataclass', data);
}

export async function saveQuestionOptionsCollege(data: any) {
    return await api.post<any>('exam', '/MasterQuestionCollege/savedetails1', data);
}

export async function getQuestionOptionsCollege(LMSMCQ_Id: number) {
    return await api.post<IQuestionOption[]>('exam', '/MasterQuestionCollege/optiondetails', { LMSMCQ_Id });
}

export async function toggleMasterQuestionCollege(LMSMCQ_Id: number) {
    return await api.post<any>('exam', '/MasterQuestionCollege/Deletedetails', { LMSMCQ_Id });
}

