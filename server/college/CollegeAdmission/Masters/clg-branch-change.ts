'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/BranchChange';

export async function getBranchChangeInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails`);
    } catch (error: any) {
        console.error('[Server] getBranchChangeInitialData error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to fetch initial data'
        } as any;
    }
}

export async function getBranchChangeCourses(data: { ASMAY_Id: number }) {
    try {
        return await api.post<any>('college', '/Atten_Subject_MaxPeriod/get_courses', data);
    } catch (error: any) {
        console.error('[Server] getBranchChangeCourses error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to fetch courses'
        } as any;
    }
}

export async function getBranchChangeBranches(data: { ASMAY_Id: number; AMCO_Id: number }) {
    try {
        return await api.post<any>('college', '/Atten_Subject_MaxPeriod/get_branches', data);
    } catch (error: any) {
        console.error('[Server] getBranchChangeBranches error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to fetch branches'
        } as any;
    }
}

export async function getBranchChangeSemesters(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    try {
        return await api.post<any>('college', '/Atten_Subject_MaxPeriod/get_semisters', data);
    } catch (error: any) {
        console.error('[Server] getBranchChangeSemesters error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to fetch semesters'
        } as any;
    }
}

export async function getBranchChangeStudents(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMS_Id_Old: number;
}) {
    try {
        return await api.post<any>('college', `${BASE_URL}/Studentdetails`, data);
    } catch (error: any) {
        console.error('[Server] getBranchChangeStudents error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to fetch students'
        } as any;
    }
}

export async function saveBranchChange(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/Savedetails`, data);
    } catch (error: any) {
        console.error('[Server] saveBranchChange error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to save branch change'
        } as any;
    }
}

export async function deactivateBranchChange(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/deactive`, data);
    } catch (error: any) {
        console.error('[Server] deactivateBranchChange error:', error);
        return {
            success: false,
            message: typeof error === 'string' ? error : error?.message || 'Failed to deactivate record'
        } as any;
    }
}
