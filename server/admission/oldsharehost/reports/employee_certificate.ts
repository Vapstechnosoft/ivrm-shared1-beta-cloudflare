'use server';

import { api } from '@/lib/apiService';

export async function getEmployeeCertificateInitialDetails() {
    const url = `/VikasaAdmissionReport/getdata`;
    return await api.get<any>('admission', url);
}

export async function getEmployeeCertificateReport(data: any) {
    const url = `/VikasaAdmissionReport/ShowReport1?HRME_Id=${data.empid}`;
    return await api.post<any>('admission', url);
}
