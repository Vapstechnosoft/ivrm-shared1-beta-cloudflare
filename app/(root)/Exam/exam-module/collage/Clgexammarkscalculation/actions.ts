'use server';

import { api } from '@/lib/apiService';
import type { ICalculationPayload, ICalculationResponse, IGetDetailsResponse, ILoadFeedbackResponse, ISaveFeedbackPayload } from './types';

// Helper to execute API requests with endpoint casing fallbacks
async function executeApiRequest<T>(
    method: 'get' | 'post',
    subPath: string,
    data?: any
): Promise<{ success: boolean; data: T | null; message?: string }> {
    const endpoints = [
        `/ClgExammarksCalculation/${subPath}`.replace(/\/+/g, '/'),
        `/clgexammarkscalculation/${subPath}`.replace(/\/+/g, '/'),
        `/ClgExammarksCalculationFacade/${subPath}`.replace(/\/+/g, '/'),
        `/clgexammarkscalculationfacade/${subPath}`.replace(/\/+/g, '/')
    ];

    let lastError: any = null;
    for (const endpoint of endpoints) {
        try {
            let res: any;
            if (method === 'get') {
                res = await api.get<T>('exam', endpoint);
            } else if (method === 'post') {
                res = await api.post<T>('exam', endpoint, data);
            }
            return {
                success: true,
                data: (res?.data || res) as T
            };
        } catch (error: any) {
            lastError = error;
            if (error?.response?.status !== 404 && error?.status !== 404) {
                break;
            }
        }
    }

    return {
        success: false,
        message: lastError?.message || lastError?.response?.data?.message || 'API request failed',
        data: null
    };
}

/**
 * Fetch initial dropdown details (Years, Courses, Semesters, Branches, Exams, Sections)
 */
export async function getInitialDetails(): Promise<{
    success: boolean;
    data: IGetDetailsResponse | null;
    message?: string;
}> {
    const endpoints = [
        '/ClgExammarksCalculation/Getdetails',
        '/clgexammarkscalculation/Getdetails',
        '/ClgExammarksCalculation/Getdetails/2',
        '/clgexammarkscalculation/Getdetails/2'
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await api.get<IGetDetailsResponse>('exam', endpoint);
            return {
                success: true,
                data: (res?.data || res) as IGetDetailsResponse
            };
        } catch (error: any) {
            if (error?.response?.status !== 404 && error?.status !== 404) {
                return {
                    success: false,
                    data: null,
                    message: error?.message || 'Failed to fetch initial details'
                };
            }
        }
    }

    return executeApiRequest<IGetDetailsResponse>('post', 'Getdetails', {});
}

/**
 * Calculate college exam marks
 */
export async function calculateCollegeMarks(payload: ICalculationPayload): Promise<{
    success: boolean;
    data: ICalculationResponse | null;
    message?: string;
}> {
    return executeApiRequest<ICalculationResponse>('post', 'Calculation', payload);
}

/**
 * Load module feedback questions (Optional)
 */
export async function loadModuleFeedback(): Promise<{
    success: boolean;
    data: ILoadFeedbackResponse | null;
    message?: string;
}> {
    try {
        const res = await api.post<ILoadFeedbackResponse>('exam', '/FeedbackTransaction/loadfeedbackquestion', {
            Flag: 'Exam'
        });
        return {
            success: true,
            data: (res?.data || res) as ILoadFeedbackResponse
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            message: error?.message || 'Failed to load feedback'
        };
    }
}

/**
 * Save module feedback answers
 */
export async function saveModuleFeedback(payload: ISaveFeedbackPayload): Promise<{
    success: boolean;
    data: any;
    message?: string;
}> {
    try {
        const res = await api.post<any>('exam', '/FeedbackTransaction/Savefeedback', payload);
        return {
            success: true,
            data: res?.data || res
        };
    } catch (error: any) {
        return {
            success: false,
            data: null,
            message: error?.message || 'Failed to save feedback'
        };
    }
}
