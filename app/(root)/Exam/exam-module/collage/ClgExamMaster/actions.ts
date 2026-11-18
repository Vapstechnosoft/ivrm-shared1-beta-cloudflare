'use server';

import { api } from '@/lib/apiService';
import type { IClgExamMasterApiResponse } from './types';

// Base route helper to handle both ClgExamMasterFacade and ClgExamMaster endpoints
async function executeApiRequest<T>(
    method: 'get' | 'post' | 'delete',
    subPath: string,
    data?: any
) {
    const endpoints = [
        `/ClgExamMasterFacade/${subPath}`.replace(/\/+/g, '/'),
        `/ClgExamMaster/${subPath}`.replace(/\/+/g, '/'),
        `/clgexammasterfacade/${subPath}`.replace(/\/+/g, '/'),
        `/clgexammaster/${subPath}`.replace(/\/+/g, '/')
    ];

    let lastError: any = null;
    for (const endpoint of endpoints) {
        try {
            let res: any;
            if (method === 'get') {
                res = await api.get<T>('exam', endpoint);
            } else if (method === 'post') {
                res = await api.post<T>('exam', endpoint, data);
            } else if (method === 'delete') {
                res = await api.delete<T>('exam', endpoint);
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
        message: lastError?.message || 'API request failed',
        data: null
    };
}

/**
 * Get all Exam Master details for grid list
 * Endpoint: ClgExamMaster/Getdetails
 */
export async function getClgExamMasterDetails(data: any = {}) {
    let result = await executeApiRequest<IClgExamMasterApiResponse>('post', 'Getdetails', data);
    if (!result.success) {
        result = await executeApiRequest<IClgExamMasterApiResponse>('get', 'Getdetails');
    }
    return result;
}

/**
 * Save / Update Exam Master
 * Endpoint: ClgExamMaster/savedetails
 */
export async function saveClgExamMaster(data: {
    EME_Id: number;
    EME_ExamCode: string;
    EME_ExamName: string;
    EME_IVRSExamName: string;
    EME_FinalExamFlag: boolean;
    EME_ExamDescription?: string;
}) {
    return await executeApiRequest<IClgExamMasterApiResponse>('post', 'savedetails', data);
}

/**
 * Edit Exam Master details
 * Endpoint: ClgExamMaster/editdetails/{id}
 */
export async function editClgExamMaster(id: number) {
    let result = await executeApiRequest<IClgExamMasterApiResponse>('get', `editdetails/${id}`);
    if (!result.success) {
        result = await executeApiRequest<IClgExamMasterApiResponse>('get', `editdeatils/${id}`);
    }
    return result;
}

/**
 * Activate / Deactivate Exam Master
 * Endpoint: ClgExamMaster/deactivate
 */
export async function deactivateClgExamMaster(record: any) {
    return await executeApiRequest<IClgExamMasterApiResponse>('post', 'deactivate', record);
}

/**
 * Validate and save exam order
 * Endpoint: ClgExamMaster/validateordernumber
 */
export async function saveClgExamMasterOrder(examDTO: any[]) {
    return await executeApiRequest<IClgExamMasterApiResponse>('post', 'validateordernumber', {
        examDTO
    });
}
