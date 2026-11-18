'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/Clgmasterbatch';

export async function getClgMasterBatchInitialData() {
    try {
        return await api.get<any>('college', `/MasterBatch/getdata`);
    } catch (error) {
        console.error('[Server] getClgMasterBatchInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function saveClgMasterBatch(data: any) {
    return await api.post<any>('college', `/MasterBatch/savebatch`, data);
}

export async function editClgMasterBatch(acmbId: number) {
    return await api.post<any>('college', `/MasterBatch/editbatch?ACMB_Id=${acmbId}`);
}

export async function deactivateClgMasterBatch(acmbId: number) {
    return await api.post<any>('college', `/MasterBatch/activedeactivebatch?ACMB_Id=${acmbId}`);
}
