'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IClgLoanScholarshipSavePayload } from '@/types/fees/college/transaction/collegeloanandscholarship';

export async function getCollegeLoanInitialData() {
    const url = '/CollegeLoanAndScholarship/get_initial_data';
    return await api.get<any>('fees', url);
}

export async function getCollegeLoanBranches(data: { courselistarray: { amcO_Id: number }[] }) {
    const url = '/CollegeLoanAndScholarship/get_branches';
    return await api.post<any>('fees', url, data);
}

export async function getCollegeLoanSemesters(data: {
    courselistarray: { amcO_Id: number }[];
    branchlistarray: { amB_Id: number }[];
}) {
    const url = '/CollegeLoanAndScholarship/get_semesters';
    return await api.post<any>('fees', url, data);
}

export async function getCollegeLoanStudents(data: {
    acmB_Id: number;
    courselistarray: { amcO_Id: number }[];
    branchlistarray: { amB_Id: number }[];
    semesterlistarray: { amsE_Id: number }[];
}) {
    const url = '/CollegeLoanAndScholarship/get_students';
    return await api.post<any>('fees', url, data);
}

export async function saveCollegeLoanAndScholarship(payload: IClgLoanScholarshipSavePayload) {
    const url = '/CollegeLoanAndScholarship/save_data';
    return await api.post<any>('fees', url, payload);
}

export async function getCollegeLoanSavedRecords(acmB_Id: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/CollegeLoanAndScholarship/get_records/${acmB_Id}${urlParams ? `?${urlParams}` : ''}`;
    return await api.get<any>('fees', url);
}

export async function deleteCollegeLoanRecord(fcL_Id: number) {
    const url = `/CollegeLoanAndScholarship/delete_record/${fcL_Id}`;
    return await api.delete<any>('fees', url);
}
