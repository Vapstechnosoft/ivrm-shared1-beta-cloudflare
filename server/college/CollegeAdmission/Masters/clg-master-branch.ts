'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/ClgMasterBranch';

export async function getClgMasterBranchInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails`);
    } catch (error) {
        console.error('[Server] getClgMasterBranchInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function saveClgMasterBranch(data: any) {
    return await api.post<any>('college', `${BASE_URL}/savebranch`, data);
}

export async function editClgMasterBranch(ambId: number) {
    return await api.post<any>('college', `${BASE_URL}/editbranch?AMB_Id=${ambId}`);
}

export async function deactivateClgMasterBranch(data: any) {
    return await api.post<any>('college', `${BASE_URL}/activedeactivebranch?AMB_Id=${data.AMB_Id || data.amB_Id}`);
}

export async function saveClgMasterBranchOrder(data: any) {
    return await api.post<any>('college', `${BASE_URL}/saveorder/`, data);
}
