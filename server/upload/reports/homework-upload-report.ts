'use server';

import { api } from '@/lib/apiService';
import type {
    IHomeWorkAttachmentResponse,
    IHomeWorkInitialData,
    IHomeWorkReportPayload,
    IHomeWorkReportResponse
} from '@/types/upload/reports/homework-upload-report';

export async function getHomeWorkInitialData() {
    const url = `/HomeworkUpload/Getdata_class`;
    return await api.post<IHomeWorkInitialData>('portal', url, 0);
}

export async function getHomeWorkReport(data: IHomeWorkReportPayload) {
    const url = '/HomeworkUpload/getreport_home';
    return await api.post<IHomeWorkReportResponse>('portal', url, data);
}

export async function viewHomeWorkAttachmentData(data: { Temp: number; ihW_Id: number }) {
    const url = `/HomeworkUpload/viewData?Temp=${data.Temp}&IHW_Id=${data.ihW_Id}&ICW_Id=0`;
    return await api.post<IHomeWorkAttachmentResponse>('portal', url, data);
}
