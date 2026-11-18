'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamTTSession } from '@/types/exam/exam-module/exam-mapping';

export async function getExamTTSessionList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_tt_session_master/exam_tt_session_grid_list?${urlParams}`;

    // Note: The new architecture backend returns { success, message, data, total, page, page_size }
    // we use `api.get` which expects `data` to be an array or object.
    // In this case it returns an array of IExamTTSession in `data`.
    return await api.get<IExamTTSession[]>('exam', url);
}

export async function addOrUpdateExamTTSession(data: {
    mI_id?: number;
    ettS_Id: number;
    ettS_SessionName: string;
    ettS_StartTime: string;
    ettS_EndTime: string;
    ettS_Activeflag: boolean;
}) {
    const url = 'exam_tt_session_master/addOrupdate_session';
    return await api.post<any>('exam', url, data);
}

export async function toggleExamTTSession(etts_id: number) {
    const url = `exam_tt_session_master/active_deactive_session/${etts_id}`;
    return await api.put<any>('exam', url);
}
