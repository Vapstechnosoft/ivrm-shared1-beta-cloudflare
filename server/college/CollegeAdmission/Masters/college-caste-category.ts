'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/Collegecastecategory';

export async function getInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/Getdetails`);
    } catch (error) {
        console.error('[Server] getInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function getCollegeCasteCategoryById(id: number) {
    try {
        return await api.post<any>('college', `${BASE_URL}/GetSelectedRowDetails?IMCC_Id=${id}`);
    } catch (error) {
        console.error('[Server] getCollegeCasteCategoryById error:', error);
        return { success: false, message: 'Failed to fetch row details' } as any;
    }
}

export async function saveCollegeCasteCategory(data: any) {
    return await api.post<any>('college', `${BASE_URL}/SaveClgcastecategoryData`, data);
}

export async function deactivateCollegeCasteCategory(data: any) {
    return await api.post<any>('college', `${BASE_URL}/Deactivate`, data);
}

export async function deleteCollegeCasteCategory(id: number) {
    try {
        return await api.post<any>('college', `${BASE_URL}/MasterDeleteModulesDATA?IMCC_Id=${id}`);
    } catch (error) {
        console.error('[Server] deleteCollegeCasteCategory error:', error);
        return { success: false, message: 'Failed to delete record' } as any;
    }
}

