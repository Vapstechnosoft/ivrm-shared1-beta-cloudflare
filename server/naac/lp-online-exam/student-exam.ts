'use server';

import { api as apiService } from '@/lib/apiService';

import { auth } from '@/lib/auth';
export async function getAvailableExams() {
    const _session = await auth();
    try {
        const response = await apiService.getArray('naac', '/StudentExamFacade/GetAvailableExams');
        return response;
    } catch (error) {
        console.error('Error fetching available exams:', error);
        return { success: false, message: error.message || String(error) };
    }
}

export async function getExamQuestions(examId: number) {
    try {
        const response = await apiService.get('naac', `/StudentExamFacade/GetExamQuestions/${examId}`);
        return response;
    } catch (error) {
        console.error('Error fetching exam questions:', error);
        return { success: false, message: error.message || String(error) };
    }
}

export async function saveAnswer(request: any) {
    try {
        const response = await apiService.post('naac', '/StudentExamFacade/SaveAnswer', request);
        return response;
    } catch (error) {
        console.error('Error saving answer:', error);
        return { success: false, message: error.message || String(error) };
    }
}

export async function submitExam(examId: number) {
    try {
        const response = await apiService.post('naac', `/StudentExamFacade/SubmitExam/${examId}`, {});
        return response;
    } catch (error) {
        console.error('Error submitting exam:', error);
        return { success: false, message: error.message || String(error) };
    }
}
