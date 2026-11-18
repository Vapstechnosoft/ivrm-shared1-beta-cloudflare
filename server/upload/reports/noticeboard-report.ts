'use server';

import { api } from '@/lib/apiService';
import type {
    INoticeBoardAttachmentResponse,
    INoticeBoardInitialData,
    INoticeBoardReportPayload,
    INoticeBoardReportResponse
} from '@/types/upload/reports/noticeboard-report';

export async function getNoticeBoardInitialData() {
    const url = `/HomeworkUpload/Getdata_class`;
    return await api.post<INoticeBoardInitialData>('portal', url, 0);
}

export async function getNoticeBoardReport(data: INoticeBoardReportPayload) {
    const url = '/HomeworkUpload/getreport_notice';
    return await api.post<INoticeBoardReportResponse>('portal', url, data);
}

export async function viewNoticeBoardAttachmentData(data: { INTB_Id: number }) {
    const url = `/StudentDashboard/viewnotice`;
    return await api.post<INoticeBoardAttachmentResponse>('portal', url, data);
}
