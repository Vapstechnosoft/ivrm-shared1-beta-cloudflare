'use server';

import { api } from '@/lib/apiService';
import type { ILibLostBookReportInitialData, ILibLostBookReportRequest } from '@/types/library/reports/lib-lost-book-report';

const MODULE_URL = '/LostBookReport';

export async function getLibLostBookReportInitialData(): Promise<ILibLostBookReportInitialData> {
    // GET AvailableBooksReport/getdetails
    // api.get() returns the HTTP body directly:
    // { success, message, data: { libraryList: [{ lmaL_Id, lmaL_LibraryName, lmaL_ActiveFlag }] } }
    const response = await api.get<any>('library', 'AvailableBooksReport/getdetails');
    const libraryList: ILibLostBookReportInitialData = response?.data?.libraryList ?? [];
    return Array.isArray(libraryList) ? libraryList : [];
}

export async function getLibLostBookReportSearch(data: ILibLostBookReportRequest) {
    // POST LostBookReport/get-lost-book-report
    // Payload: { MI_Id, p_booktype, p_bnbflg, p_fromdate, p_todate, p_lmal_id }
    // api.post() returns the HTTP body: { success, message, data: [...], total }
    const response = await api.post<any>('library', `${MODULE_URL}/get-lost-book-report`, data);
    const list = response?.data;
    return Array.isArray(list) ? list : [];
}
