'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IGradeDetails, IMasterGrade } from '@/types/exam/exam-module/masters';

export async function getMasterGrade(searchParams?: ApiSearchparams) {
    const params = searchParams ? { ...searchParams } : {};
    if (params.search_query) {
        const sq = params.search_query.trim().toLowerCase();
        if (sq === 'percentage' || sq === 'percent') {
            params.search_query = 'P';
        } else if (sq === 'marks' || sq === 'mark') {
            params.search_query = 'M';
        }
    }
    const urlParams = getSearchParamsUrl(params);
    const url = `/master_exam_grade?${urlParams}`;
    return await api.get<IMasterGrade>('exam', url);
}
export async function getMasterGradeDropdownList() {
    const url = '/master_exam_grade/master_exam_grade_drop_down_list';
    return await api.get<IMasterGrade[]>('exam', url);
}

export async function addOrUpdateMasterGrade(data: any) {
    const url = '/master_exam_grade';
    return await api.post<any>('exam', url, data);
}

export async function getGradeDetailsById(id: number) {
    const url = `/master_exam_grade/exam_grade_details_by_id/${id}`;
    return await api.get<IGradeDetails>('exam', url);
}

export async function toggleMasterGrade(id: number) {
    const url = `/master_exam_grade/toggle/${id}`;
    return await api.put('exam', url);
}
