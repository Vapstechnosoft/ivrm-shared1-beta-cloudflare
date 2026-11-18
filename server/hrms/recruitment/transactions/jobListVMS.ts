'use server';
import { type ApiResponse, api } from '@/lib/apiService';

export async function getBasicDataJobListVMS(): Promise<ApiResponse<any>> {
    const url = '/api/JobListVMS/GetBasicData';
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching basic job list VMS data:', error);
        throw error;
    }
}

export async function saveOrUpdateJobListVMS(data: any): Promise<ApiResponse<any>> {
    const url = '/api/JobListVMS/SaveOrUpdate';
    try {
        const response = await api.post('hrmsrecruitment', url, data);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Job posting saved successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error saving job posting VMS:', error);
        throw error;
    }
}
