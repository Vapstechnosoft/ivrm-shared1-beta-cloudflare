'use server';

import { api } from '@/lib/apiService';
import { IClgPreadmissionStatusFilter, IClgPreadmissionStatusUpdate } from '@/types/college/transactions';

const CTRL = 'CollegePreadmissionStatus';

export async function getPreadmissionStatusData(data: any = {}) {
    try {
        return await api.post<any>('college', `/${CTRL}/getalldetails`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch preadmission status data' } as any;
    }
}

export async function searchPreadmissionStudents(data: IClgPreadmissionStatusFilter) {
    try {
        return await api.post<any>('college', `/${CTRL}/searchuser`, data);
    } catch (error) {
        return { success: false, message: 'Failed to search students' } as any;
    }
}

export async function updatePreadmissionStatus(data: IClgPreadmissionStatusUpdate) {
    try {
        return await api.post<any>('college', `/${CTRL}/saveUseronce`, data);
    } catch (error) {
        return { success: false, message: 'Failed to update status' } as any;
    }
}

export async function sendStatusOTP(data: { otptype: string; sms?: boolean; email?: boolean }) {
    try {
        return await api.post<any>('college', `/${CTRL}/sendotpsms`, data);
    } catch (error) {
        return { success: false, message: 'Failed to send OTP' } as any;
    }
}

export async function verifyStatusOTP(data: { forgetEmailOTP: string }) {
    try {
        return await api.post<any>('college', `/${CTRL}/VerifyforgetEmailOtp`, data);
    } catch (error) {
        return { success: false, message: 'Failed to verify OTP' } as any;
    }
}

export async function getClgApplicationStudentRemarks(data: { pacA_Id: number }) {
    try {
        return await api.post<any>('college', `/${CTRL}/Clgapplicationsturemarks`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch remarks' } as any;
    }
}

export async function getClgApplicationStudentDocs(data: { pacA_Id: number }) {
    try {
        return await api.post<any>('college', `/${CTRL}/Clgapplicationstudocs`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch documents' } as any;
    }
}

export async function getClgApplicationData(data: { pacA_Id: number }) {
    try {
        return await api.post<any>('college', `/${CTRL}/Clgapplicationdata`, data);
    } catch (error) {
        return { success: false, message: 'Failed to fetch application data' } as any;
    }
}
