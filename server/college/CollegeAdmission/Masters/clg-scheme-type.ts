'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/CLGSubjectSchemeType';

export async function getSchemeTypes() {
    try {
        return await api.get<any>('college', `${BASE_URL}/`);
    } catch (error) {
        console.error('[Server] getSchemeTypes error:', error);
        return { success: false, message: 'Failed to fetch scheme types' } as any;
    }
}

export async function saveSchemeType(data: any) {
    return await api.post<any>('college', `${BASE_URL}/savetype`, data);
}

export async function toggleSchemeType(data: any) {
    return await api.post<any>('college', `${BASE_URL}/activedeactivebatch`, data);
}

export async function getSchemeNames() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getsubject`);
    } catch (error) {
        console.error('[Server] getSchemeNames error:', error);
        return { success: false, message: 'Failed to fetch scheme names' } as any;
    }
}

export async function saveSchemeName(data: any) {
    return await api.post<any>('college', `${BASE_URL}/savename`, data);
}

export async function toggleSchemeName(data: any) {
    return await api.post<any>('college', `${BASE_URL}/activedeactivebatch1`, data);
}

export async function getCombinations() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getcombination?pageid=2`);
    } catch (error) {
        console.error('[Server] getCombinations error:', error);
        return { success: false, message: 'Failed to fetch combinations' } as any;
    }
}

export async function saveCombination(data: any) {
    return await api.post<any>('college', `${BASE_URL}/savecombination`, data);
}

export async function toggleCombination(data: any) {
    return await api.post<any>('college', `${BASE_URL}/activedeactivecomb`, data);
}
