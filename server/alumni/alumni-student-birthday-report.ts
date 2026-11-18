'use server';

import { api } from '@/lib/apiService';

export async function getBirthdayReportInitialData() {
    const url = 'studentbirthday/getYear/1';
    return await api.get<any>('alumni', url);
}

export async function getBirthdayReportDetails(data: any) {
    return await api.post<any>('alumni', 'studentbirthday/getdetails', data);
}
