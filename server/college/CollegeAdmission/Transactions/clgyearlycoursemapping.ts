'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/Clgyearlycoursemapping';

export async function getClgYearlyCourseMappingInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails`);
    } catch (error) {
        console.error('[Server] getClgYearlyCourseMappingInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function getClgYearlyCourseMappingBranches(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/getbranches?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}`);
    } catch (error) {
        console.error('[Server] getClgYearlyCourseMappingBranches error:', error);
        return { success: false, message: 'Failed to fetch branches' } as any;
    }
}

export async function getClgYearlyCourseMappingSemesters(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/getsemisters?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&noofsem=${data.noofsem}`);
    } catch (error) {
        console.error('[Server] getClgYearlyCourseMappingSemesters error:', error);
        return { success: false, message: 'Failed to fetch semesters' } as any;
    }
}

export async function searchClgYearlyCourseMappingData(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/searchdata?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&noofsem=${data.noofsem}`);
    } catch (error) {
        console.error('[Server] searchClgYearlyCourseMappingData error:', error);
        return { success: false, message: 'Failed to search data' } as any;
    }
}

export async function saveClgYearlyCourseMappingData(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/savedata`, data);
    } catch (error) {
        console.error('[Server] saveClgYearlyCourseMappingData error:', error);
        return { success: false, message: 'Failed to save data' } as any;
    }
}

export async function viewClgYearlyCourseMappingRecords(data: any) {
    try {
        const asmayId = data.ASMAY_Id ?? data.asmaY_Id;
        const amcoId = data.AMCO_Id ?? data.amcO_Id;
        const ambId = data.AMB_Id ?? data.amB_Id;
        const acaycbId = data.ACAYCB_Id ?? data.acaycB_Id;
        const acaycId = data.ACAYC_Id ?? data.acayC_Id;
        
        return await api.post<any>('college', `${BASE_URL}/viewrecordspopup?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&ACAYCB_Id=${acaycbId}&ACAYC_Id=${acaycId}`);
    } catch (error) {
        console.error('[Server] viewClgYearlyCourseMappingRecords error:', error);
        return { success: false, message: 'Failed to fetch records' } as any;
    }
}
