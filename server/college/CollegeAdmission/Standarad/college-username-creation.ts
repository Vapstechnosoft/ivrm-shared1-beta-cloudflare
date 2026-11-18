'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/CollegeUsernameCreation';

export async function getCollegeUsernameCreationInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails`);
    } catch (error) {
        console.error('[Server] getCollegeUsernameCreationInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function getCollegeUsernameCreationOnYearChange(asmayId: number) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onyearchange?ASMAY_Id=${asmayId}`);
    } catch (error) {
        console.error('[Server] getCollegeUsernameCreationOnYearChange error:', error);
        return { success: false, message: 'Failed to fetch on year change data' } as any;
    }
}

export async function getCollegeUsernameCreationOnCourseChange(asmayId: number, amcoId: number) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onCoursechange?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}`);
    } catch (error) {
        console.error('[Server] getCollegeUsernameCreationOnCourseChange error:', error);
        return { success: false, message: 'Failed to fetch on course change data' } as any;
    }
}

export async function getCollegeUsernameCreationOnBranchChange(asmayId: number, amcoId: number, ambId: number) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onBranchchange?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}`);
    } catch (error) {
        console.error('[Server] getCollegeUsernameCreationOnBranchChange error:', error);
        return { success: false, message: 'Failed to fetch on branch change data' } as any;
    }
}

export async function getCollegeUsernameCreationOnSemChange(asmayId: number, amcoId: number, ambId: number, amseId: number) {
    try {
        return await api.post<any>('college', `${BASE_URL}/onSemchange?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}`);
    } catch (error) {
        console.error('[Server] getCollegeUsernameCreationOnSemChange error:', error);
        return { success: false, message: 'Failed to fetch on sem change data' } as any;
    }
}

export async function getCollegeUsernameCreationStudentDetails(asmayId: number, amcoId: number, ambId: number, amseId: number, acmsId: number, studentType: string) {
    try {
        return await api.post<any>('college', `${BASE_URL}/get_Studentdetails?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}&ACMS_Id=${acmsId}&Studenttype=${studentType}`);
    } catch (error) {
        console.error('[Server] getCollegeUsernameCreationStudentDetails error:', error);
        return { success: false, message: 'Failed to fetch student details' } as any;
    }
}

export async function saveCollegeUsernameCreation(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/saveatt`, data);
    } catch (error) {
        console.error('[Server] saveCollegeUsernameCreation error:', error);
        return { success: false, message: 'Failed to save generated usernames' } as any;
    }
}

export async function getCollegeUsernameCreationStudentUsername(asmayId: number, amcoId: number, ambId: number, amseId: number, acmsId: number, studentType: string) {
    try {
        return await api.post<any>('college', `${BASE_URL}/getStudentusername?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}&ACMS_Id=${acmsId}&Studenttype=${studentType}`);
    } catch (error) {
        console.error('[Server] getCollegeUsernameCreationStudentUsername error:', error);
        return { success: false, message: 'Failed to fetch student usernames' } as any;
    }
}

export async function sendCollegeUsernameCreationSMS(data: any) {
    try {
        return await api.post<any>('college', `${BASE_URL}/SendSMS`, data);
    } catch (error) {
        console.error('[Server] sendCollegeUsernameCreationSMS error:', error);
        return { success: false, message: 'Failed to send SMS/Email' } as any;
    }
}
