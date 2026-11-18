'use server';

import type {
    ISportsYearEndReportClassData,
    ISportsYearEndReportData,
    ISportsYearEndReportLoadData,
    ISportsYearEndReportRequest,
    ISportsYearEndReportSectionData
} from '@/app/(root)/Sports/Reports/SportsYearEndReport/types';
import { api } from '@/lib/apiService';

export async function getSportsYearEndReportLoadData(): Promise<ISportsYearEndReportLoadData> {
    try {
        const response = await api.post<ISportsYearEndReportLoadData>('sports', 'StudentAgeCalcReport/Getdetails', {});
        return response.data || { yearlist: [], houseList: [] };
    } catch (error) {
        console.error('Error fetching load data:', error);
        return { yearlist: [], houseList: [] };
    }
}

export async function getSportsYearEndReportClasses(asmaY_Id: number): Promise<ISportsYearEndReportClassData> {
    try {
        const response = await api.post<ISportsYearEndReportClassData>('sports', 'StudentAgeCalcReport/get_class', { asmaY_Id });
        return response.data || { classList: [] };
    } catch (error) {
        console.error('Error fetching classes:', error);
        return { classList: [] };
    }
}

export async function getSportsYearEndReportSections(asmaY_Id: number, asmcL_Id: number): Promise<ISportsYearEndReportSectionData> {
    try {
        const response = await api.post<ISportsYearEndReportSectionData>('sports', 'StudentAgeCalcReport/get_section', {
            asmaY_Id,
            asmcL_Id
        });
        return response.data || { sectionList: [] };
    } catch (error) {
        console.error('Error fetching sections:', error);
        return { sectionList: [] };
    }
}

export async function getSportsYearEndReport(data: ISportsYearEndReportRequest): Promise<ISportsYearEndReportData[]> {
    try {
        const response = await api.post<any>('sports', 'YearEndReport/getReport', data);

        // Handle different response structures gracefully
        if (response.data?.reportList) return response.data.reportList;
        if (Array.isArray(response.data)) return response.data;
        if (response.data) return [response.data]; // fallback if single object

        return [];
    } catch (error) {
        console.error('Error generating report:', error);
        return [];
    }
}
