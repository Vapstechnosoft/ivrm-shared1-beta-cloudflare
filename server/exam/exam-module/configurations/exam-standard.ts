'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type { IExamStandard } from '@/types/exam/exam-module/configurations';

export async function getExamStandard(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_standard/get_exam_config_list/?${urlParams}`;
    const response = await api.get<IExamStandard>('exam', url);
    console.log('Exam Standard Response:', response);
    return { ...response };
}

export async function UpdateExamStandard(data: any) {
    try {
        const session = await auth();
        const payload = {
            ...data,
            mI_Id: data.mI_Id || (session?.mi_id ? Number(session.mi_id) : undefined)
        };
        const res = await api.post<any>('exam', '/exam_standard/add_or_update_exam_config', payload);
        return res;
    } catch (error: any) {
        console.error('Error updating exam standard:', error);
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to update exam standard',
            data
        };
    }
}
