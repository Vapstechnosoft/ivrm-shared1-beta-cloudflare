'use server';

import { api } from '@/lib/apiService';
import type {
    IPDAReportLoadData,
    IPDAReportRequest,
    IPDAReportResponse,
    IPDAReportSection,
    IPDAReportStudent
} from '@/types/pda/report/pda-report';

const serviceName = 'pettycashandassettracking';

export async function getPDAReportLoadData() {
    const pageId = 2;
    const url = `PDAReport/getalldetails/${pageId}`;
    return await api.get<IPDAReportLoadData>(serviceName, url);
}

export async function getPDAReportSections(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = 'PDAReport/getsection';
    return await api.post<IPDAReportSection>(serviceName, url, data);
}

export async function getPDAReportStudents(data: { ASMAY_Id: number; ASMCL_Id: number; AMSC_Id: number }) {
    const url = 'PDAReport/getstudent';
    return await api.post<IPDAReportStudent>(serviceName, url, data);
}

export async function generatePDAReport(data: IPDAReportRequest) {
    const url = 'PDAReport/radiobtndata';
    return await api.post<IPDAReportResponse>(serviceName, url, data);
}
