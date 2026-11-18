'use server';

import { api } from '@/lib/apiService';
import type { IClgExamMasterGradeApiResponse } from './types';

// Helper to execute API requests with fallback endpoint resolution
async function executeApiRequest<T>(
    method: 'get' | 'post' | 'delete',
    subPath: string,
    data?: any
) {
    const endpoints = [
        `/ClgExamMasterGradeFacade/${subPath}`.replace(/\/+/g, '/'),
        `/ClgExamMasterGrade/${subPath}`.replace(/\/+/g, '/'),
        `/clgexammastergradefacade/${subPath}`.replace(/\/+/g, '/'),
        `/clgexammastergrade/${subPath}`.replace(/\/+/g, '/')
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
 * [HttpGet("getpagedetails/{id:int}")] or [HttpGet("getalldetails")]
 * Loads all master grade records on page init
 */
export async function getClgExamMasterGradeAllDetails(id: number = 2) {
    // Try getpagedetails first as defined in the controller
    let result = await executeApiRequest<IClgExamMasterGradeApiResponse>('get', `getpagedetails/${id}`);
    if (!result.success) {
        // Fallback to getalldetails (legacy standard)
        result = await executeApiRequest<IClgExamMasterGradeApiResponse>('get', 'getalldetails');
    }
    if (!result.success) {
        result = await executeApiRequest<IClgExamMasterGradeApiResponse>('get', `getdetails/${id}`);
    }
    if (!result.success) {
        result = await executeApiRequest<IClgExamMasterGradeApiResponse>('post', 'getalldetails', {});
    }
    return result;
}

/**
 * [HttpPost("savedetail")]
 * Save or update Master Grade with sub-details
 */
export async function saveClgExamMasterGrade(data: {
    EMGR_Id: number;
    EMGD_Id?: number;
    EMGR_GradeName: string;
    EMGR_MarksPerFlag: string;
    sub_list: any[];
}) {
    return await executeApiRequest<IClgExamMasterGradeApiResponse>('post', 'savedetail', data);
}

/**
 * [HttpGet("getdetails/{id:int}")]
 * Get Grade details for editing
 */
export async function getClgExamMasterGradeEditDetails(id: number) {
    let result = await executeApiRequest<IClgExamMasterGradeApiResponse>('get', `getdetails/${id}`);
    if (!result.success) {
        result = await executeApiRequest<IClgExamMasterGradeApiResponse>('get', `getpagedetails/${id}`);
    }
    return result;
}

/**
 * [HttpPost("deactivate")]
 * Activate / Deactivate Grade Master
 */
export async function deactivateClgExamMasterGrade(record: any) {
    return await executeApiRequest<IClgExamMasterGradeApiResponse>('post', 'deactivate', record);
}

/**
 * [HttpGet("getalldetailsviewrecords/{id:int}")]
 * View Master Grade details popup records
 */
export async function getClgExamMasterGradeViewRecords(id: number) {
    let result = await executeApiRequest<IClgExamMasterGradeApiResponse>(
        'get',
        `getalldetailsviewrecords/${id}`
    );
    if (!result.success) {
        result = await executeApiRequest<IClgExamMasterGradeApiResponse>(
            'post',
            'getalldetailsviewrecords',
            { EMGR_Id: id }
        );
    }
    return result;
}

/**
 * [HttpDelete("deletedetails/{id:int}")]
 * Delete Master Grade record
 */
export async function deleteClgExamMasterGrade(id: number) {
    let result = await executeApiRequest<IClgExamMasterGradeApiResponse>('delete', `deletedetails/${id}`);
    if (!result.success) {
        result = await executeApiRequest<IClgExamMasterGradeApiResponse>('post', `deletedetails/${id}`, {});
    }
    return result;
}
