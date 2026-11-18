'use client';

import { type ApiResponse, api } from '@/lib/apiService';

export interface InterviewSchedule {
    hrciS_Id: number;
    hrcisC_Id: number;
    hrcD_Id: number;

    hrciS_InterviewFeedBack: string;
    hrciS_CandidateStatus: string;

    hrcisC_Status: string | undefined;

    hrciS_Datetime: string;

    hrcmG_Id: number;
}

export async function getInterviewFeedbackGridData(): Promise<ApiResponse<any>> {
    try {
        const url = '/api/AddCandidateInterviewVMS/get_interviewer_feedback_list';
        const reponse = await api.get('hrmsrecruitment', url);
        if (reponse.success) {
            return {
                success: reponse?.success,
                message: reponse?.message || 'Data fetched successfully',
                data: reponse?.data || reponse
            };
        } else {
            return {
                success: reponse?.success,
                message: reponse?.message || 'Data fetched successfully',
                data: reponse?.data || reponse
            };
        }
    } catch (error: any) {
        console.error('Error fetching master job grid data:', error);
        throw error;
    }
}

export async function saveInterviewerFeedback(data: InterviewSchedule): Promise<ApiResponse<any>> {
    const url = '/api/AddCandidateInterviewVMS/save_interview_feedback';
    try {
        const response = await api.post('hrmsrecruitment', url, data);
        if (response.success) {
            return {
                success: response?.success,
                message: response?.message || 'Data fetched successfully',
                data: response?.data || response
            };
        } else {
            return {
                success: response?.success,
                message: response?.message || 'Data fetched successfully',
                data: response?.data || response
            };
        }
    } catch (error: any) {
        console.error('Error fetching master job grid data:', error);
        throw error;
    }
}

export async function getCandidateInterviewList(): Promise<ApiResponse<any>> {
    try {
        const url = '/api/AddCandidateInterviewVMS/get_candidate_interview_list';
        const reponse = await api.get('hrmsrecruitment', url);
        if (reponse.success) {
            return {
                success: reponse?.success,
                message: reponse?.message || 'Data fetched successfully',
                data: reponse?.data || reponse
            };
        } else {
            return {
                success: reponse?.success,
                message: reponse?.message || 'Data fetched successfully',
                data: reponse?.data || reponse
            };
        }
    } catch (error: any) {
        console.error('Error fetching master job grid data:', error);
        throw error;
    }
}
