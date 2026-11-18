'use server';

import { api } from '@/lib/apiService';
import type { AllotmentReportSchema } from '@/schemas/hostel/reports/allotment-report.schema';

const URL_BASE = 'CLGStudentRequestReport/';
const SERVICE_NAME = 'hostel';

export const getAllotmentReportLoadData = async () => {
    // Try CLGHostelVacateReport/get_clg_hostel_vacate with default service
    try {
        const response = await api.get<any>('default', 'CLGHostelVacateReport/get_clg_hostel_vacate');
        if (response.data) {
            return {
                yearlist: response.data.yearlist || response.data.yearList || response.data.yerlist || [],
                hostellist: response.data.hostellist || response.data.hostelList || response.data.hostelist || []
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
                yearlist: response.data.yearlist || response.data.yearList || response.data.yerlist || [],
                hostellist: response.data.hostellist || response.data.hostelList || response.data.hostelist || []
            };
        }
    } catch (error) {
        console.error('All load data endpoints failed:', error);
    }

    return { yearlist: [], hostellist: [] };
};

export const getAllotmentReport = async (data: AllotmentReportSchema): Promise<any> => {
    try {
        const payload = {
            type: data.type,
            frmdate: data.frmdate,
            todate: data.todate,
            ASMAY_Id: data.ASMAY_Id,
            HLMH_Id: data.HLMH_Id
        };
        const response = await api.post<any>(SERVICE_NAME, URL_BASE + 'getreport', payload);
        return response.data;
    } catch (error) {
        console.error('Error generating report:', error);
        return { griddata: [] };
    }
};
