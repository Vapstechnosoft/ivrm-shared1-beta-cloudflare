'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IPDADebitCreditReportParams } from '@/types/pettycash/report/PDADebitCreditReport';

export async function getPDADebitCreditReportInitialData() {
    const session = await auth();
    const mi_id = session?.mi_id || 2;
    const url = `/PDAReport/getalldetails/${mi_id}`;
    return await api.get<any>('pettycashandassettracking', url);
}

export async function getPDADebitCreditReportSections(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
}) {
    const url = `/PDAReport/getsection`;
    return await api.post<any>('pettycashandassettracking', url, data);
}

export async function getPDADebitCreditReportStudents(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    AMSC_Id: number;
}) {
    const url = `/PDAReport/getstudent`;
    return await api.post<any>('pettycashandassettracking', url, data);
}

export async function getPDADebitCreditReport(data: IPDADebitCreditReportParams) {
    const url = `/PDAReport/pdadebicreditreport`;
    return await api.post<any>('pettycashandassettracking', url, data);
}
