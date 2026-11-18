'use server';

import { api } from '@/lib/apiService';
import type {
    IPDAOverAllLoadData,
    IPDAOverAllReportRequest,
    IPDAOverAllReportResponse,
    IPDAOverAllSection
} from '@/types/pda/report/pda-overall-report';

const serviceName = 'pettycashandassettracking';

export async function getPDAOverAllLoadData() {
    const pageId = 2;
    const url = `PDAReport/getalldetails/${pageId}`;
    return await api.get<IPDAOverAllLoadData>(serviceName, url);
}

export async function getPDAOverAllSections(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = 'PDAReport/getsection';
    return await api.post<IPDAOverAllSection>(serviceName, url, data);
}

export async function generatePDAOverAllReport(data: IPDAOverAllReportRequest) {
    const url = 'PDAReport/overallreport';
    return await api.post<IPDAOverAllReportResponse>(serviceName, url, data);
}
