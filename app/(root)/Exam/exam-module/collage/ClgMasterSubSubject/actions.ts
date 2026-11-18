'use server';

import { api } from '@/lib/apiService';
import type { IClgMasterSubSubjectApiResponse } from './types';

// Base route helper to handle both ClgmastersubsubjectFacade and Clgmastersubsubject endpoints
async function executeApiRequest<T>(
    method: 'get' | 'post' | 'delete',
    subPath: string,
    data?: any
) {
    const endpoints = [
        `/ClgmastersubsubjectFacade/${subPath}`.replace(/\/+/g, '/'),
        `/Clgmastersubsubject/${subPath}`.replace(/\/+/g, '/'),
        `/ClgMasterSubSubjectFacade/${subPath}`.replace(/\/+/g, '/'),
        `/ClgMasterSubSubject/${subPath}`.replace(/\/+/g, '/')
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
            // If not 404, stop iterating
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
 * Get all Master Sub-Subject details for grid list
 * Endpoint: [HttpPost("Getdetails")] on ClgmastersubsubjectFacade
 */
export async function getClgMasterSubSubjectDetails(data: any = {}) {
    let result = await executeApiRequest<IClgMasterSubSubjectApiResponse>('post', 'Getdetails', data);
    if (!result.success) {
        result = await executeApiRequest<IClgMasterSubSubjectApiResponse>('get', 'Getdetails');
    }
    return result;
}

/**
 * Save / Update Master Sub-Subject
 * Endpoint: [HttpPost("savedetails")] on ClgmastersubsubjectFacade
 */
export async function saveClgMasterSubSubject(data: {
    emsS_Id: number;
    EMSS_SubSubjectName: string;
    EMSS_SubSubjectCode: string;
}) {
    return await executeApiRequest<IClgMasterSubSubjectApiResponse>('post', 'savedetails', data);
}

/**
 * Edit Master Sub-Subject details
 * Endpoint: [HttpGet("editdeatils/{id:int}")] on ClgmastersubsubjectFacade
 */
export async function editClgMasterSubSubject(id: number) {
    let result = await executeApiRequest<IClgMasterSubSubjectApiResponse>('get', `editdeatils/${id}`);
    if (!result.success) {
        result = await executeApiRequest<IClgMasterSubSubjectApiResponse>('get', `Editdetails/${id}`);
    }
    return result;
}

/**
 * Activate / Deactivate Master Sub-Subject
 * Endpoint: [HttpPost("deactivate")] on ClgmastersubsubjectFacade
 */
export async function deactivateClgMasterSubSubject(record: any) {
    return await executeApiRequest<IClgMasterSubSubjectApiResponse>('post', 'deactivate', record);
}

/**
 * Delete Master Sub-Subject
 * Endpoint: Clgmastersubsubject/MasterDeleteModulesDTO/{id}
 */
export async function deleteClgMasterSubSubject(id: number) {
    let result = await executeApiRequest<IClgMasterSubSubjectApiResponse>('delete', `MasterDeleteModulesDTO/${id}`);
    if (!result.success) {
        result = await executeApiRequest<IClgMasterSubSubjectApiResponse>('post', `MasterDeleteModulesDTO/${id}`, {});
    }
    return result;
}

/**
 * Validate and save sub-subject order
 * Endpoint: Clgmastersubsubject/validateordernumber
 */
export async function saveClgMasterSubSubjectOrder(subsubjectDTO: any[]) {
    return await executeApiRequest<IClgMasterSubSubjectApiResponse>('post', 'validateordernumber', {
        subsubjectDTO
    });
}
