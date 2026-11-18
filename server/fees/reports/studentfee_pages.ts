'use server';

import { api } from '@/lib/apiService';
import type { IFeeStudentAcademicYear } from '@/types/fees/masters';
import type { StudentPortalPrintDetails } from '@/types/fees/transactions/transactions';

export async function getStudentFeeReceiptDropDown(asmay_Id: number) {
    const url = `/FeesCommon/GetReceiptsDropDownStudentPortal/${asmay_Id}`;
    return await api.get<any[]>('fees', url);
}

export async function getFeeStudentAcademicYearDropdown() {
    const url = '/FeesCommon/StudentDashBoardFeesYrdata';
    console.info('getAcademicYearDropdown', url);
    return await api.get<IFeeStudentAcademicYear[]>('fees', url);
}

export async function getStudentPortalPrintDetails(payload: any) {
    const url = '/FeeStudentTransaction/Portal-fee-print-details';
    return await api.post<StudentPortalPrintDetails[]>('fees', url, payload);
}
