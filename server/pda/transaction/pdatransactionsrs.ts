'use server';

import { api } from '@/lib/apiService';
import type {
    IPDATransactionLoadData,
    IPDATransactionSaveRequest,
    IPDATransactionSearchRequest
} from '@/types/pda/transaction/pdatransactionsrs';

const serviceName = 'pettycashandassettracking';

export async function getPDATransactionLoadData() {
    const pageId = 2;
    const url = `PDATransaction/getalldetails/${pageId}`;
    return await api.get<IPDATransactionLoadData>(serviceName, url);
}

export async function searchStudents(data: any) {
    const url = 'PDATransaction/searchfilter';
    return await api.post<any>(serviceName, url, data);
}

export async function getStudentDetails(data: any) {
    const url = 'PDATransaction/getstudentdetails';
    return await api.post<any>(serviceName, url, data);
}

export async function getSections(data: any) {
    const url = 'PDATransaction/getsection';
    return await api.post<any>(serviceName, url, data);
}

export async function getStudentsByClassSection(data: any) {
    const url = 'PDATransaction/getstudent';
    return await api.post<any>(serviceName, url, data);
}

export async function searchTransactions(data: IPDATransactionSearchRequest) {
    const url = 'PDATransaction/searching';
    return await api.post<any>(serviceName, url, data);
}

export async function savePDATransaction(data: IPDATransactionSaveRequest) {
    const url = 'PDATransaction/Savedatasrs';
    return await api.post<any>(serviceName, url, data);
}

export async function deletePDATransaction(data: { PDAE_ID: number }) {
    const url = 'PDATransaction/Deletedetails';
    return await api.post<any>(serviceName, url, data);
}

export async function deleteMultiplePDATransactions(data: { PDAE_Ids: number[] }) {
    const url = 'PDATransaction/multippleDeletedetails';
    return await api.post<any>(serviceName, url, data);
}

export async function editPDATransaction(data: { ASMAY_Id: number; PDAE_ID: number; Amst_Id: number }) {
    const url = 'PDATransaction/edittransaction';
    return await api.post<any>(serviceName, url, data);
}

export async function saveAndUpdatePDATransaction(data: any) {
    const url = 'PDATransaction/saveandupdate';
    return await api.post<any>(serviceName, url, data);
}

export async function getHeadDetails(data: { PDAE_ID: number }) {
    const url = 'PDATransaction/getheaddetails';
    return await api.post<any>(serviceName, url, data);
}
