'use server';

import { api } from '@/lib/apiService';
import type { IBookRegisterReportRequest } from '@/types/library/reports/book-register-report';

const MODULE_URL = 'BookRegisterReport';

export async function getBookRegisterReportInitialData() {
    const response = await api.get<any>('library', `${MODULE_URL}/Book-Regester-getdetails`);
    return response.data || response;
}

export async function getBookRegisterReportSearch(data: IBookRegisterReportRequest) {
    const response = await api.post<any>('library', `${MODULE_URL}/get_report`, data);
    return response.data;
}
