'use server';

import { api } from '@/lib/apiService';

const SERVICE_NAME = 'default';
const API_BASE_URL = 'HostelVacateReport';

export const getVacateReportLoadData = async (type: string): Promise<any> => {
    // Try CLGHostelVacateReport/get_clg_hostel_vacate with default service
    try {
        const response = await api.get<any>('default', 'CLGHostelVacateReport/get_clg_hostel_vacate');
        if (response.data) {
            return {
                yerlist: response.data.yearlist || response.data.yearList || response.data.yerlist || [],
                hostelist: response.data.hostellist || response.data.hostelList || response.data.hostelist || [],
                studentlist: response.data.studentlist || response.data.studentList || [],
                stafflist: response.data.stafflist || response.data.staffList || [],
                guestlist: response.data.guestlist || response.data.guestList || []
            };
        }
    } catch (error) {
        console.warn('Failed to load using default service for CLGHostelVacateReport, trying hostel service...', error);
    }

    // Try CLGHostelVacateReport/get_clg_hostel_vacate with hostel service
    try {
        const response = await api.get<any>('hostel', 'CLGHostelVacateReport/get_clg_hostel_vacate');
        if (response.data) {
            return {
                yerlist: response.data.yearlist || response.data.yearList || response.data.yerlist || [],
                hostelist: response.data.hostellist || response.data.hostelList || response.data.hostelist || [],
                studentlist: response.data.studentlist || response.data.studentList || [],
                stafflist: response.data.stafflist || response.data.staffList || [],
                guestlist: response.data.guestlist || response.data.guestList || []
            };
        }
    } catch (error) {
        console.error('All load data endpoints failed:', error);
    }

    return { yerlist: [], hostelist: [], studentlist: [], stafflist: [], guestlist: [] };
};

export const getStudentListForReport = async (ASMAY_Id: number): Promise<any> => {
    try {
        const response = await api.post<any>(SERVICE_NAME, `${API_BASE_URL}/get_Studentlist`, { ASMAY_Id });
        return response.data;
    } catch (error) {
        console.error('Error fetching student list for report:', error);
        return { studentList: [] };
    }
};

export const getVacateReport = async (data: any): Promise<any> => {
    try {
        const payload = {
            ...data,
            Fromdate: data.Fromdate ? new Date(data.Fromdate).toISOString() : null,
            ToDate: data.ToDate ? new Date(data.ToDate).toISOString() : null
        };
        const response = await api.post<any>(SERVICE_NAME, `${API_BASE_URL}/get_report`, payload);
        return response.data;
    } catch (error) {
        console.error('Error generating vacate report:', error);
        return { success: false, message: 'Failed to generate report', gridlistdata: [] };
    }
};
