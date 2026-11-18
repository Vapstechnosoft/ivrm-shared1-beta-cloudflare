'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { ICollegeMasterBank } from '@/types/fees/college/transaction/transaction';

export async function getCollegeFeeTransactionDetails(asmaY_Id: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/CollegeFeeTransaction/fee-details?ASMAY_Id=${asmaY_Id || 0}&${urlParams}`;
    return await api.post<any>('fees', url);
}

export async function searchCollegeStudentName(payload: any) {
    const url = '/CollegeFeeTransaction/fee-stud-search-filter';
    return await api.post<any>('fees', url, payload);
}

export async function getCollegeStudentDetails(payload: any) {
    const url = '/CollegeFeeTransaction/fee-stud-lst-det';
    return await api.post<any>('fees', url, payload);
}

export async function getCollegeFeeHeadDetails(payload: any) {
    const url = '/CollegeFeeTransaction/fee-term-details';
    return await api.post<any>('fees', url, payload);
}

export async function saveCollegeFeeTransaction(payload: any) {
    const url = '/CollegeFeeTransaction/fee-Save-details';
    return await api.post<any>('fees', url, payload);
}

export async function deleteCollegeFeeTransaction(payload: any) {
    const url = '/CollegeFeeTransaction/fee-delete-transaction';
    return await api.post<any>('fees', url, payload);
}

export async function getCollegeStudentPrintDetails(payload: any) {
    const url = '/CollegeFeeTransaction/fee-print-details';
    return await api.post<any>('fees', url, payload);
}

export async function getCollegeMasterBank() {
    const url = '/FeesCommon/bank-details';
    return await api.get<ICollegeMasterBank[]>('fees', url);
}
