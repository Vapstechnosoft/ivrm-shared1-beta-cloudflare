'use server';

import { api } from '@/lib/apiService';

const SERVICE_NAME = 'default';

export interface CollegeAllotmentReportDto {
    griddata?: any[];
    [key: string]: any;
}

export const getCollegeAllotmentReportLoadData = async () => {
    // Try CLGHostelAllotmentReport/getdata/2
    try {
        const response = await api.get<any>(SERVICE_NAME, 'CLGHostelAllotmentReport/getdata/2');
        if (response.data) {
            return {
                yearlist: response.data.yearlist || response.data.yerlist || [],
                hostellist: response.data.hostellist || response.data.hostelist || []
            };
        }
    } catch (error) {
        console.warn('CLGHostelAllotmentReport/getdata/2 failed, attempting alternative...', error);
    }

    // Try CLGHostelAllotmentReport/loaddata
    try {
        const response = await api.post<any>(SERVICE_NAME, 'CLGHostelAllotmentReport/loaddata', { type: 'student' });
        if (response.data) {
            return {
                yearlist: response.data.yearlist || response.data.yerlist || [],
                hostellist: response.data.hostellist || response.data.hostelist || []
            };
        }
    } catch (error) {
        console.warn('CLGHostelAllotmentReport/loaddata failed, attempting alternative...', error);
    }

    // Try CLGHostel_Allotment_Report/getdata/2
    try {
        const response = await api.get<any>(SERVICE_NAME, 'CLGHostel_Allotment_Report/getdata/2');
        if (response.data) {
            return {
                yearlist: response.data.yearlist || response.data.yerlist || [],
                hostellist: response.data.hostellist || response.data.hostelist || []
            };
        }
    } catch (error) {
        console.warn('CLGHostel_Allotment_Report/getdata/2 failed, attempting alternative...', error);
    }

    // Fallback: Try school endpoint Hostel_Allotment_Report/getdata/2
    try {
        const response = await api.get<any>(SERVICE_NAME, 'Hostel_Allotment_Report/getdata/2');
        if (response.data) {
            return {
                yearlist: response.data.yearlist || response.data.yerlist || [],
                hostellist: response.data.hostellist || response.data.hostelist || []
            };
        }
    } catch (error) {
        console.error('All load data endpoints failed:', error);
    }

    return { yearlist: [], hostellist: [] };
};

export const getCollegeAllotmentReport = async (data: any) => {
    const payload = {
        type: data.type,
        frmdate: data.frmdate ? new Date(data.frmdate).toISOString() : null,
        todate: data.todate ? new Date(data.todate).toISOString() : null,
        ASMAY_Id: Number(data.ASMAY_Id),
        HLMH_Id: Number(data.HLMH_Id)
    };

    // Try CLGHostelAllotmentReport/getreport
    try {
        const response = await api.post<any>(SERVICE_NAME, 'CLGHostelAllotmentReport/getreport', payload);
        if (response.data) return response.data;
    } catch (error) {
        console.warn('CLGHostelAllotmentReport/getreport failed, trying get_report...', error);
    }

    // Try CLGHostelAllotmentReport/get_report
    try {
        const response = await api.post<any>(SERVICE_NAME, 'CLGHostelAllotmentReport/get_report', payload);
        if (response.data) return response.data;
    } catch (error) {
        console.warn('CLGHostelAllotmentReport/get_report failed, trying CLGHostel_Allotment_Report/getreport...', error);
    }

    // Try CLGHostel_Allotment_Report/getreport
    try {
        const response = await api.post<any>(SERVICE_NAME, 'CLGHostel_Allotment_Report/getreport', payload);
        if (response.data) return response.data;
    } catch (error) {
        console.warn('CLGHostel_Allotment_Report/getreport failed, trying CLGHostel_Allotment_Report/get_report...', error);
    }

    // Try CLGHostel_Allotment_Report/get_report
    try {
        const response = await api.post<any>(SERVICE_NAME, 'CLGHostel_Allotment_Report/get_report', payload);
        if (response.data) return response.data;
    } catch (error) {
        console.warn('CLGHostel_Allotment_Report/get_report failed, trying school endpoint...', error);
    }

    // Fallback to school endpoint
    try {
        const response = await api.post<any>(SERVICE_NAME, 'Hostel_Allotment_Report/getreport', payload);
        if (response.data) return response.data;
    } catch (error) {
        console.error('All report generation endpoints failed:', error);
    }

    return { griddata: [] };
};
