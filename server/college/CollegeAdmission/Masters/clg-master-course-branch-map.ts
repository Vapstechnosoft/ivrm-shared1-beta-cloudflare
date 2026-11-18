'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/ClgMasterCourseBranchMap';

export async function getCourseBranchMapInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/Get_details`);
    } catch (error) {
        console.error('[Server] getCourseBranchMapInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function saveCourseBranchMap(data: any) {
    return await api.post<any>('college', `${BASE_URL}/Save_details`, data);
}

export async function deactivateCourseBranchMap(data: any) {
    const id = data.amcobM_Id || data.AMCOBM_Id;
    return await api.post<any>('college', `${BASE_URL}/Deletedetails?AMCOBM_Id=${id}`, data);
}

export async function deactivateSemesterCourseBranchMap(data: any) {
    const id = data.amcobmS_Id || data.AMCOBMS_Id;
    return await api.post<any>('college', `${BASE_URL}/deactivesem?AMCOBMS_Id=${id}`, data);
}

export async function editCourseBranchMap(id: number) {
    return await api.post<any>('college', `${BASE_URL}/edit?AMCOBM_Id=${id}`);
}

export async function getCourseBranchMapModalDetails(id: number) {
    return await api.post<any>('college', `${BASE_URL}/showmodaldetails?AMCOBM_Id=${id}`);
}
