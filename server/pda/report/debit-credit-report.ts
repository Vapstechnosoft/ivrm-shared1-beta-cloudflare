'use server';

import { api } from '@/lib/apiService';
import type {
    IPDALoadDataResponse,
    IPDAReportResponse,
    IPDASectionResponse,
    IPDAStudentResponse
} from '@/types/pda/report/debit-credit-report';

export async function getPDAReportLoadData() {
    const pageId = 2;
    const url = `PDAReport/getalldetails/${pageId}`;
    return await api.get<IPDALoadDataResponse>('pettycashandassettracking', url);
}

export async function getPDASectionsSRS(data: { ASMAY_Id: number; classlsttwo: { ASMCL_Id: number }[] }) {
    const url = 'PDAReport/getsectionSRS';
    return await api.post<IPDASectionResponse>('pettycashandassettracking', url, data);
}

export async function getPDAStudentsSRS(data: {
    ASMAY_Id: number;
    classlsttwo: { ASMCL_Id: number }[];
    sectionlistarray: { AMSC_Id: number }[];
}) {
    const url = 'PDAReport/getstudentSRS';
    return await api.post<IPDAStudentResponse>('pettycashandassettracking', url, data);
}

export async function generatePDADebitCreditReportSRS(data: {
    ASMAY_Id: number;
    classlsttwo: { ASMCL_Id: number }[];
    sectionlistarray: { AMSC_Id: number }[];
    Amst_Id: number;
    From_Date: string;
    To_Date: string;
    type: string;
}) {
    const url = 'PDAReport/pdadebicreditreportSRS';
    return await api.post<IPDAReportResponse>('pettycashandassettracking', url, data);
}
