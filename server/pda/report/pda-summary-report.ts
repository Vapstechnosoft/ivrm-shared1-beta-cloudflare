'use server';

import { api } from '@/lib/apiService';
import type {
    IPDASummaryLoadData,
    IPDASummaryReportRequest,
    IPDASummaryReportResponse,
    IPDASummarySection,
    IPDASummaryStudent
} from '@/types/pda/report/pda-summary-report';

const serviceName = 'pettycashandassettracking';

export async function getPDASummaryReportLoadData() {
    const pageId = 2;
    const url = `PDASummaryReport/getalldetails/${pageId}`;
    return await api.get<IPDASummaryLoadData>(serviceName, url);
}

export async function getPDASummaryReportSections(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = 'PDASummaryReport/getsection';
    return await api.post<IPDASummarySection>(serviceName, url, data);
}

export async function getPDASummaryReportStudents(data: { ASMAY_Id: number; ASMCL_Id: number; AMSC_Id: number }) {
    const url = 'PDASummaryReport/getstudent';
    return await api.post<IPDASummaryStudent>(serviceName, url, data);
}

export async function generatePDASummaryReport(data: IPDASummaryReportRequest) {
    const url = 'PDASummaryReport/radiobtndata';
    return await api.post<IPDASummaryReportResponse>(serviceName, url, data);
}
