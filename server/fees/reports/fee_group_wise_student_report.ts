'use server';

import { api } from '@/lib/apiService';
import type { IFeeCategoryDropdown } from '@/types/fees/reports/reports';

export async function getStudentDropDown(asmayId: number, asmclId: number, asmsId: number) {
    const url = `/FeeGroupWiseStudentReportFacade/GetStudentDetails/${asmayId}/${asmclId}/${asmsId}`;
    return await api.get<any[]>('fees', url);
}

export async function getClassAndFeeGroupDropDown(asmayId: number) {
    const url = `/FeeGroupWiseStudentReportFacade/GetClassGroupdata/${asmayId}`;
    return await api.get<any[]>('fees', url);
}

export async function getCategoryDropDown() {
    const url = '/FeeGroupWiseStudentReportFacade/GetCategorydata';
    return await api.get<IFeeCategoryDropdown[]>('fees', url);
}

export async function getReport(payload: any) {
    const url = '/FeeGroupWiseStudentReportFacade/GroupwiseStudentReportRequest';
    return await api.post<any[]>('fees', url, payload);
}
