'use server';
import { type ApiResponse, api } from '@/lib/apiService';

export async function getCadidateGridData(): Promise<ApiResponse<any>> {
    const url = '/api/AddCandidateVMS/get_candidates_grid';
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching master job grid data:', error);
        throw error;
    }
}

export async function saveOrUpdateCandidate(data: any): Promise<ApiResponse<any>> {
    const url = '/api/AddCandidateVMS/save_or_update_candidate';
    try {
        const response = await api.post('hrmsrecruitment', url, data);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Candidate saved successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error saving candidate:', error);
        throw error;
    }
}

export async function toggleCandidateStatus(hrcd_Id: number): Promise<ApiResponse<any>> {
    const url = `/api/AddCandidateVMS/toggle_candidate/${hrcd_Id}`;
    try {
        const response = await api.put('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Status toggled successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error toggling candidate status:', error);
        throw error;
    }
}

export async function getCandidateDetails(hrcd_Id: number): Promise<ApiResponse<any>> {
    const url = `/api/AddCandidateVMS/candidate_details/${hrcd_Id}`;
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Details fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching candidate details:', error);
        throw error;
    }
}
