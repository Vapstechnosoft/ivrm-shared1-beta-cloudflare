'use server';

import { type ApiResponse, api } from '@/lib/apiService';

// -------------------------- Master Job Server FUNCTIONS --------------------------

export interface saveOrUpdateJobPayload {
    hrmJ_Id: number;
    hrmJ_JobCode: string;
    hrmJ_JobTiTle: string;
    hrmlO_Id: number;
    hrC_Id: number;
    hrmJ_Posted: string;
}

export async function getMasterGridData(): Promise<ApiResponse<any>> {
    const url = '/api/MasterJob/get_master_job_grid';
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

export async function saveOrUpdateJob(payload: saveOrUpdateJobPayload): Promise<ApiResponse<any>> {
    const url = '/api/MasterJob/save_or_update_job';
    try {
        const response = await api.post('hrmsrecruitment', url, payload);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Job saved successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error saving/updating job:', error);
        throw error;
    }
}

export async function getMasterJobByIdData(jobId: number): Promise<ApiResponse<any>> {
    const url = `/api/MasterJob/get_job_by_id/${jobId}`;
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching master job by jobid data:', error);
        throw error;
    }
}

export async function toggleJobStatusData(jobId: number): Promise<ApiResponse<any>> {
    const url = `/api/MasterJob/toggle_job_status/${jobId}`;
    try {
        const response = await api.put('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Job deleted successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error deleting job by jobid data:', error);
        throw error;
    }
}

// -------------------------- Institution by Login Server FUNCTIONS --------------------------

export async function getInstitutionByLogin(): Promise<ApiResponse<any>> {
    const url = '/api/MasterDropDown/get_login_based_institutions';
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching institution by login data:', error);
        throw error;
    }
}

export async function getCandidateDropDownDataByInstitution(): Promise<ApiResponse<any>> {
    const url = `/api/AddCandidateInterviewVMS/get_candidates_by_institutionId`;
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching candidate dropdown data:', error);
        throw error;
    }
}
