'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IBMIReport,
    IBMIReportClass,
    IBMIReportLoadData,
    IBMIReportRequest,
    IBMIReportSection
} from '@/types/sports/reports/bmi-report';

const API_URL = {
    GET_DETAILS: 'BMIReport/getDetails',
    GET_CLASS: 'BMIReport/get_class',
    GET_SECTION: 'BMIReport/get_section',
    REPORT: 'BMIReport/report'
};

export async function getBMIReportLoadData(): Promise<IBMIReportLoadData> {
    try {
        console.log('Fetching BMI Report Load Data...');
        const response = await api.post<{ academicYear: any[]; houseList: any[] }>('sports', API_URL.GET_DETAILS, {});
        console.log('BMI Report Load Data Response:', JSON.stringify(response));
        return {
            academicYear: response.data?.academicYear || [],
            houseList: response.data?.houseList || []
        };
    } catch (error) {
        console.error('Error fetching BMI Report Load Data:', error);
        return { academicYear: [], houseList: [] };
    }
}

export async function getClassesForBMI(asMAY_Id: number): Promise<IBMIReportClass[]> {
    try {
        const response = await api.post<{ classList: IBMIReportClass[] }>('sports', API_URL.GET_CLASS, { asmaY_Id: asMAY_Id });
        return response.data?.classList || [];
    } catch (error) {
        console.error('Error fetching Classes for BMI:', error);
        return [];
    }
}

export async function getSectionsForBMI(asMAY_Id: number, asmcL_Id: number): Promise<IBMIReportSection[]> {
    try {
        const response = await api.post<{ sectionList: IBMIReportSection[] }>('sports', API_URL.GET_SECTION, {
            asmaY_Id: asMAY_Id,
            asmcL_Id: asmcL_Id
        });
        return response.data?.sectionList || [];
    } catch (error) {
        console.error('Error fetching Sections for BMI:', error);
        return [];
    }
}

export async function getBMIReport(data: IBMIReportRequest, searchParams?: ApiSearchparams): Promise<ApiResponse<IBMIReport[]>> {
    try {
        const payload = {
            mI_Id: data.mI_Id,
            asmaY_Id: data.ASMAY_Id,
            asmcL_Id: data.ASMCL_Id,
            selectedSectionlist: data.selectedSectionlist
        };

        const paramsUrl = getSearchParamsUrl(searchParams);
        const urlWithParams = paramsUrl ? `${API_URL.REPORT}?${paramsUrl}` : API_URL.REPORT;

        const response = await api.post<IBMIReport[]>('sports', urlWithParams, payload);

        return response;
    } catch (error) {
        console.error('Error generating BMI Report:', error);
        return {
            success: false,
            message: 'Failed to generate report',
            data: [],
            total: 0,
            page: 1,
            page_Size: 10
        };
    }
}
