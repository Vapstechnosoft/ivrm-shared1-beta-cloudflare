'use server';

import { type ApiResponse, api } from '@/lib/apiService';

export interface CandidateInterviewListPayload {
    hrcisC_Id: number;
    hrcD_Id: number;
    hrcisC_InterviewRounds: string;
    hrcisC_InterviewDate: string;
    hrcisC_InterviewVenue: string;
    hrcisC_Status: string;
    hrcisC_NotificationEmail?: boolean;
    hrcisC_NotificationSMS?: boolean;
    hrcisC_ActiveFlg?: boolean;
    // Map with alternative casing to be robust
    HRCISC_Id?: number;
    HRCD_Id?: number;
}

/**
 * Get candidate interview list (includes candidateDetailsList and interviewerList)
 * GET /api/CandidateInterviewListVMS/Get_candidate_interview_list
 */
export async function getCandidateInterviewListVMS(): Promise<ApiResponse<any>> {
    const url = '/api/CandidateInterviewListVMS/Get_candidate_interview_list';
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching candidate interview list:', error);
        throw error;
    }
}

/**
 * Get a candidate interview record by ID
 * POST /api/CandidateInterviewListVMS/GetRecordById
 */
export async function getCandidateInterviewByIdVMS(hrcisC_Id: number): Promise<ApiResponse<any>> {
    const url = `/api/CandidateInterviewListVMS/GetRecordById?HRCISC_Id=${hrcisC_Id}`;
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Record fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error(`Error fetching candidate interview record by id ${hrcisC_Id}:`, error);
        throw error;
    }
}

/**
 * Toggle candidate interview active/deactive status
 * POST /api/CandidateInterviewListVMS/Active_DeactivateBy_Id
 */
export async function toggleCandidateInterviewStatusVMS(hrcisC_Id: number): Promise<ApiResponse<any>> {
    const url = `/api/CandidateInterviewListVMS/Active_DeactivateBy_Id?HRCISC_Id=${hrcisC_Id}`;
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Status toggled successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error(`Error toggling candidate interview status for id ${hrcisC_Id}:`, error);
        throw error;
    }
}

/**
 * Save or update candidate interview
 * POST /api/CandidateInterviewListVMS/save_or_update_candidate_interview
 */
export async function saveOrUpdateCandidateInterviewVMS(payload: CandidateInterviewListPayload): Promise<ApiResponse<any>> {
    // We try the standard path: save_or_update_candidate_interview
    const url = '/api/CandidateInterviewListVMS/Save_Update_Record';
    try {
        const response = await api.post('hrmsrecruitment', url, payload);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Candidate interview saved successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error saving candidate interview:', error);
        throw error;
    }
}
