'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

// ==========================================
// ONLINE EXAM REPORTS
// ==========================================

export async function getOnlineExamReportLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/LP_OnlineStudentExam/getloaddatareport/2?${urlParams}`;
    return await api.get<any>('exam', url);
}

export async function getOnlineExamReport(data: {
    asmaY_Id: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    ismS_Id?: number;
    lmsmoE_Id?: number;
    type?: string; // 'all' | 'pass' | 'fail'
}) {
    const url = '/LP_OnlineStudentExam/getreport';
    return await api.post<any>('exam', url, data);
}

export async function getStudentWiseExamMarksDetails(data: {
    amsT_Id: number;
    lmsmoE_Id: number;
}) {
    const url = '/LP_OnlineStudentExam/ViewStudentWiseMarks';
    return await api.post<any>('exam', url, data);
}

export async function getStaffWiseExamReport(data: {
    asmaY_Id: number;
    hrmE_Id?: number;
}) {
    const url = '/LP_OnlineExam/GetStaffWiseExamReport';
    return await api.post<any>('exam', url, data);
}

export async function getOnlineExamStudentNotSubmittedReport(data: {
    asmaY_Id: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    ismS_Id?: number;
    lmsmoE_Id?: number;
}) {
    const url = '/LP_OnlineStudentExam/getNonSubmittedreport';
    return await api.post<any>('exam', url, data);
}
