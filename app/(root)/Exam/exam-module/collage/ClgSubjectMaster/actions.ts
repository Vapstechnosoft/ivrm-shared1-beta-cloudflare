'use server';

import { api } from '@/lib/apiService';

// Base route helper to handle both ClgSubjectMasterFacade and ClgSubjectMaster
async function executeApiRequest<T>(
    method: 'get' | 'post' | 'delete',
    subPath: string,
    data?: any
) {
    const endpoints = [
        `/ClgSubjectMasterFacade/${subPath}`.replace(/\/+/g, '/'),
        `/ClgSubjectMaster/${subPath}`.replace(/\/+/g, '/')
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
                data: res?.data || res
            };
        } catch (error: any) {
            lastError = error;
            // If 404, continue to next endpoint variant
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
 * [HttpGet("getalldetails/{id:int}")]
 */
export async function getClgSubjectMasterDetails(pageId: number = 2) {
    return await executeApiRequest<any>('get', `getalldetails/${pageId}`);
}

/**
 * [HttpPost("getdetails")]
 */
export async function getClgSubjectMasterByDto(data: any = {}) {
    return await executeApiRequest<any>('post', 'getdetails', data);
}

/**
 * [HttpPost("savedetail")]
 */
export async function saveClgMasterSubject(data: any) {
    return await executeApiRequest<any>('post', 'savedetail', data);
}

/**
 * [HttpGet("Editdetails/{id:int}")]
 */
export async function editClgMasterSubject(id: number) {
    return await executeApiRequest<any>('get', `Editdetails/${id}`);
}

/**
 * [HttpDelete("Deletedetails/{id:int}")]
 */
export async function deleteClgMasterSubject(id: number) {
    // Controller defines [HttpDelete("Deletedetails/{id:int}")]
    let result = await executeApiRequest<any>('delete', `Deletedetails/${id}`);
    if (!result.success) {
        // Fallback to post if route was mapped via POST in legacy gateways
        result = await executeApiRequest<any>('post', `Deletedetails/${id}`, {});
    }
    return result;
}

/**
 * [HttpPost("validateordernumber")]
 */
export async function saveClgSubjectOrder(subjectDTO: any[]) {
    return await executeApiRequest<any>('post', 'validateordernumber', { subjectDTO });
}

/**
 * [HttpPost("savedata2")]
 */
export async function saveClgSubjectMapping(data: any) {
    return await executeApiRequest<any>('post', 'savedata2', data);
}
