'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/Collegemastercaste';

export async function getCollegeMasterCasteInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/Getdetails`);
    } catch (error: any) {
        console.error('[Server] getCollegeMasterCasteInitialData error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to fetch initial data'
        } as any;
    }
}

export async function getCollegeMasterCasteById(id: number) {
    try {
        return await api.post<any>('college', `${BASE_URL}/GetSelectedRowDetails?IMC_Id=${id}`);
    } catch (error: any) {
        console.error('[Server] getCollegeMasterCasteById error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to fetch row details'
        } as any;
    }
}

export async function saveCollegeMasterCaste(data: any) {
    try {
        const payload = {
            iC_Id: Number(data.iC_Id ?? data.IC_Id ?? 0),
            imcC_Id: Number(data.imcC_Id ?? data.IMCC_Id),
            iC_CasteName: data.iC_CasteName ?? data.IC_CasteName ?? '',
            iC_CasteDesc: data.iC_CasteDesc ?? data.IC_CasteDesc ?? '',
            IC_Id: Number(data.iC_Id ?? data.IC_Id ?? 0),
            IMCC_Id: Number(data.imcC_Id ?? data.IMCC_Id),
            IC_CasteName: data.iC_CasteName ?? data.IC_CasteName ?? '',
            IC_CasteDesc: data.iC_CasteDesc ?? data.IC_CasteDesc ?? ''
        };
        return await api.post<any>('college', `${BASE_URL}/SaveClgMasterCaste`, payload);
    } catch (error: any) {
        console.error('[Server] saveCollegeMasterCaste error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to save caste'
        } as any;
    }
}

export async function deleteCollegeMasterCaste(id: number) {
    try {
        return await api.post<any>('college', `${BASE_URL}/MasterDeleteModulesDATA?IMC_Id=${id}`);
    } catch (error: any) {
        console.error('[Server] deleteCollegeMasterCaste error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to delete caste'
        } as any;
    }
}
