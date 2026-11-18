'use server';

import { type ApiResponse, api } from '@/lib/apiService';

export async function getCandidatesAndInterviewers(): Promise<ApiResponse<any>> {
    const url = `/api/AddCandidateInterviewVMS/get_candidates_interviewers`;
    try {
        const response = await api.get<any>('hrmsrecruitment', url);
        if (response?.success) {
            return {
                success: response?.success ?? true,
                message: response?.message || 'Data fetched successfully',
                data: response?.data || response
            };
        } else {
            return { success: false, message: 'Failed to fetch candidates and interviewers', data: [] };
        }
    } catch (error) {
        console.error('❌ [API ERROR] Failed to fetch candidates and interviewers:', error);
        return { success: false, message: 'Failed to fetch candidates and interviewers', data: [] };
    }
}
