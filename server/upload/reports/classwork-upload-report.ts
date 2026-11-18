'use server';

import { api } from '@/lib/apiService';
import type {
    IClassWorkAttachmentResponse,
    IClassWorkInitialData,
    IClassWorkReportPayload,
    IClassWorkReportResponse
} from '@/types/upload/reports/classwork-upload-report';

export async function getClassWorkInitialData() {
    const url = `/HomeworkUpload/Getdata_class`;
    return await api.post<IClassWorkInitialData>('portal', url, 0);
}

export async function getClassWorkReport(data: IClassWorkReportPayload) {
    const url = '/HomeworkUpload/getreport_class';
    return await api.post<IClassWorkReportResponse>('portal', url, data);
}

export async function viewClassWorkAttachmentData(data: { ICW_Id: number; Temp: number }) {
    const url = `/HomeworkUpload/viewData?Temp=${data.Temp}&IHW_Id=0&ICW_Id=${data.ICW_Id}`;
    return await api.post<IClassWorkAttachmentResponse>('portal', url, data);
}
