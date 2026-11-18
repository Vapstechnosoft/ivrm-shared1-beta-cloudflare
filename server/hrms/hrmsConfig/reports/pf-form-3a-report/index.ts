'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import type { PFForm3AReportSearchRequest, PFForm3AReportSearchResponse } from '@/types/hrms/reports/pf-form-3a-report';

export async function searchPFForm3AReport(request: PFForm3AReportSearchRequest): Promise<ApiResponse<PFForm3AReportSearchResponse>> {
    const url = '/api/ReportPFForm3A/getEmployeedetailsBySelection';
    const requestBody: PFForm3AReportSearchRequest = {
        MI_Id: request.MI_Id || 30,
        HRME_Id: request.HRME_Id || 0,
        HRES_Year: request.HRES_Year || ''
    };
    console.log('🔵 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));
    let response: any;
    try {
        response = await api.get<PFForm3AReportSearchResponse>('hrms', url, {
            params: {
                MI_Id: requestBody.MI_Id,
                HRME_Id: requestBody.HRME_Id,
                HRES_Year: requestBody.HRES_Year
            }
        });
        console.log('🔵 [SERVER] Response:', JSON.stringify(response, null, 2));
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to search PF Form 3A report',
            data: {
                MI_Id: request.MI_Id || 30,
                retrunMsg: error?.message || 'Failed to search',
                roleId: 0
            }
        };
    }
    // The backend returns raw data, not wrapped in ApiResponse format
    // Wrap it to match the expected ApiResponse structure
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        // Already wrapped
        return response as ApiResponse<PFForm3AReportSearchResponse>;
    }
    // Wrap raw response data
    const rawResponse = response as unknown as PFForm3AReportSearchResponse;
    return {
        success: true,
        message: rawResponse?.retrunMsg || 'Search completed successfully',
        data: rawResponse
    };
}

/**
 * Get basic data for year and employee
 * POST /api/ReportPFForm3A/getBasicData
 */
export async function getPFForm3ABasicData(): Promise<ApiResponse<any>> {
    const url = '/api/ReportPFForm3A/getBasicData';
    try {
        const response = await api.get<any>('hrms', url);
        console.log('🔵 [SERVER] PFForm3A getBasicData Response:', JSON.stringify(response, null, 2));
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to load PF Form 3A basic data',
            data: null
        };
    }
}
