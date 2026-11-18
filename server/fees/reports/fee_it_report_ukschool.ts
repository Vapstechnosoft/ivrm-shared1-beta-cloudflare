'use server';

import { api } from '@/lib/apiService';

export async function getStudentDropDown() {
    const url = '/FeeITReceiptReportFacade/StudentList';
    return await api.get<any[]>('fees', url);
}

export async function studentFilterDropDown(filterTYpe: string) {
    const url = `/FeeITReceiptReportFacade/getstuddetabasedonfilterddata/${filterTYpe}`;
    return await api.get<any[]>('fees', url);
}

export async function feeItReceipt(amst_Id: number, asmay_Id: number) {
    const url = `/FeeITReceiptReportFacade/getreportData/${amst_Id}/${asmay_Id}`;
    return await api.get<any[]>('fees', url);
}
