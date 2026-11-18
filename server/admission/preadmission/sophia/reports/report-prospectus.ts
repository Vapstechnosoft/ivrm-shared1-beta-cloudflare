'use server';

import { api } from '@/lib/apiService';

export async function getReportProspectusInitialData() {
    try {
        const response = await api.get<any>('preadmission', '/ReportProspectus/GetIntial_data');
        return response.data || response;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch initial data');
    }
}

export async function getReportProspectusDetails(data: any) {
    try {
        const { From_Date, To_Date, ASMAY_Id } = data;
        const url = `/ReportProspectus/Getdetails?From_Date=${From_Date || ''}&To_Date=${To_Date || ''}&ASMAY_Id=${ASMAY_Id || 0}`;
        const response = await api.post<any>('preadmission', url);
        return response.data || response;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch prospectus details');
    }
}

export async function searchReportProspectus(data: any) {
    try {
        const response = await api.post<any>('preadmission', '/ReportProspectus/searchprospectus', data);
        return response.data || response;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to search prospectus details');
    }
}

export async function sendSms(data: any) {
    try {
        const response = await api.post<any>('preadmission', '/ReportProspectus/SendSms', data);
        return response.data || response;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to send SMS');
    }
}

export async function sendMail(data: any) {
    try {
        const response = await api.post<any>('preadmission', '/ReportProspectus/SendMail', data);
        return response.data || response;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to send Mail');
    }
}
