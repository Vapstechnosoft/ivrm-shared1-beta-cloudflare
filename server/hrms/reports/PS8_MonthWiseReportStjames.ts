'use server';
import { api } from '@/lib/apiService';

export interface PS8MonthWiseReportDataRequest {
    flag: string;
    year: number;
}

export async function getPS8MonthWiseReportData(data: PS8MonthWiseReportDataRequest) {
    try {
        const { year, flag } = data;
        const url = `/api/ReportPS7andPS8Form/get_ps8_form_report/${flag}/${year}`;
        const response = await api.get<any>('hrms', url);
        if (response.success) return { success: true, data: response.data, message: response.message };
        return { success: false, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
