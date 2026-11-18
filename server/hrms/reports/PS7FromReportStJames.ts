'use server';
import { api } from '@/lib/apiService';

export interface PS7ReportDataRequest {
    hrmE_Ids: string;
    year: number;
}

export async function getPS7ReportEmployees() {
    try {
        const response = await api.get<any>('hrms', '/api/ReportPS7andPS8Form/emp_drop_down_for_ps7_and_ps8');
        if (response.success) return { success: true, data: response.data, message: response.message };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getPS7ReportData(data: PS7ReportDataRequest) {
    try {
        const { hrmE_Ids, year } = data;
        const response = await api.get<any>('hrms', `/api/ReportPS7andPS8Form/get_ps7_form_report/${hrmE_Ids}/${year}`);
        if (response.success) return { success: true, data: response.data, message: response.message };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
