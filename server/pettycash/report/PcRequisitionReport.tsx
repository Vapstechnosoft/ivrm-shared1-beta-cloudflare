'use server';

import { api } from '@/lib/apiService';

export async function getRequisitionReportOrganization(data: any = {}) {
    const url = '/PC_ReportFacade/GetInstitutionDropDown';
    console.log('data', data);
    return await api.get<any>('pettycashandassettracking', url, data);
}

export async function RequistionReport(data: any) {
    const url = `/PC_ReportFacade/PCRequisitionReportVVVS/${data.fromDate}/${data.toDate}/${data.reportType}`;
    console.log('url', url);
    return await api.get<any>('pettycashandassettracking', url, data);
}

export async function getParticularDetail(data: any) {
    const url = `/PC_ReportFacade/getparticulardetail`;
    return await api.post<any>('pettycashandassettracking', url, data);
}
