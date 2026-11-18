'use server';

import { api } from '@/lib/apiService';
import type {
    IDeactivateResponse,
    IGetDetailsResponse,
    IGetGroupDetailsResponse,
    ISaveGroupPayload,
    ISaveGroupResponse,
    IViewRecordsResponse
} from './types';

// Helper to execute API requests with endpoint casing fallbacks
async function executeApiRequest<T>(
    method: 'get' | 'post',
    subPath: string,
    data?: any
): Promise<{ success: boolean; data: T | null; message?: string }> {
    const endpoints = [
        `/ClgMasterSubjectGroup/${subPath}`.replace(/\/+/g, '/'),
        `/clgmastersubjectgroup/${subPath}`.replace(/\/+/g, '/'),
        `/ClgMasterSubjectGroupFacade/${subPath}`.replace(/\/+/g, '/'),
        `/clgmastersubjectgroupfacade/${subPath}`.replace(/\/+/g, '/')
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
 * Fetch initial list of subjects and groups
 */
export async function getInitialDetails(): Promise<{
    success: boolean;
    data: IGetDetailsResponse | null;
    message?: string;
}> {
    const endpoints = [
        '/ClgMasterSubjectGroup/getalldetails',
        '/clgmastersubjectgroup/getalldetails',
        '/ClgMasterSubjectGroup/getalldetails/2',
        '/clgmastersubjectgroup/getalldetails/2'
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

    return executeApiRequest<IGetDetailsResponse>('post', 'getalldetails', {});
}

/**
 * Save or update subject group
 */
export async function saveSubjectGroup(payload: ISaveGroupPayload): Promise<{
    success: boolean;
    data: ISaveGroupResponse | null;
    message?: string;
}> {
    return executeApiRequest<ISaveGroupResponse>('post', 'savedetail', payload);
}

/**
 * Get subject group details by ID for editing
 */
export async function getGroupDetailsById(id: number): Promise<{
    success: boolean;
    data: IGetGroupDetailsResponse | null;
    message?: string;
}> {
    const endpoints = [`/ClgMasterSubjectGroup/getdetails/${id}`, `/clgmastersubjectgroup/getdetails/${id}`];

    for (const endpoint of endpoints) {
        try {
            const res = await api.get<IGetGroupDetailsResponse>('exam', endpoint);
            return {
                success: true,
                data: (res?.data || res) as IGetGroupDetailsResponse
            };
        } catch (error: any) {
            if (error?.response?.status !== 404 && error?.status !== 404) {
                return {
                    success: false,
                    data: null,
                    message: error?.message || 'Failed to load group details'
                };
            }
        }
    }

    return executeApiRequest<IGetGroupDetailsResponse>('get', `getdetails/${id}`);
}

/**
 * Activate or deactivate subject group
 */
export async function toggleGroupStatus(payload: any): Promise<{
    success: boolean;
    data: IDeactivateResponse | null;
    message?: string;
}> {
    return executeApiRequest<IDeactivateResponse>('post', 'deactivate', payload);
}

/**
 * Fetch mapped subjects for a group to display in popup
 */
export async function getGroupSubjectsView(id: number): Promise<{
    success: boolean;
    data: IViewRecordsResponse | null;
    message?: string;
}> {
    const endpoints = [`/ClgMasterSubjectGroup/getalldetailsviewrecords/${id}`, `/clgmastersubjectgroup/getalldetailsviewrecords/${id}`];

    for (const endpoint of endpoints) {
        try {
            const res = await api.get<IViewRecordsResponse>('exam', endpoint);
            return {
                success: true,
                data: (res?.data || res) as IViewRecordsResponse
            };
        } catch (error: any) {
            if (error?.response?.status !== 404 && error?.status !== 404) {
                return {
                    success: false,
                    data: null,
                    message: error?.message || 'Failed to load group mapped subjects'
                };
            }
        }
    }

    return executeApiRequest<IViewRecordsResponse>('get', `getalldetailsviewrecords/${id}`);
}
