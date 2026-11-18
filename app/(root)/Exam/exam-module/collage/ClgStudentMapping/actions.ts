'use server';

import { api } from '@/lib/apiService';
import type {
    IGetBranchResponse,
    IGetCourseResponse,
    IGetDetailsResponse,
    IGetSectionResponse,
    IGetSemesterResponse,
    ISaveMappingPayload,
    ISaveMappingResponse,
    IStudentDetailsResponse,
    IStudentDetailsSearchPayload
} from './types';

// Helper to execute API requests with endpoint casing fallbacks
async function executeApiRequest<T>(
    method: 'get' | 'post',
    subPath: string,
    data?: any
): Promise<{ success: boolean; data: T | null; message?: string }> {
    const endpoints = [
        `/ClgStudentMapping/${subPath}`.replace(/\/+/g, '/'),
        `/clgstudentmapping/${subPath}`.replace(/\/+/g, '/'),
        `/ClgStudentMappingFacade/${subPath}`.replace(/\/+/g, '/'),
        `/clgstudentmappingfacade/${subPath}`.replace(/\/+/g, '/')
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
 * Fetch initial dropdown details (Years, Courses, Branches, Semesters, Sections, Subject Groups)
 */
export async function getInitialDetails(): Promise<{
    success: boolean;
    data: IGetDetailsResponse | null;
    message?: string;
}> {
    const endpoints = [
        '/ClgStudentMapping/getalldetails',
        '/clgstudentmapping/getalldetails',
        '/ClgStudentMapping/getalldetails/2',
        '/clgstudentmapping/getalldetails/2'
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
 * Fetch courses by Year
 */
export async function getCoursesByYear(payload: {
    ASMAY_Id: number;
}): Promise<{
    success: boolean;
    data: IGetCourseResponse | null;
    message?: string;
}> {
    return executeApiRequest<IGetCourseResponse>('post', 'getcourse', payload);
}

/**
 * Fetch branches by Course & Year
 */
export async function getBranchesByCourse(payload: {
    ASMAY_Id: number;
    AMCO_Id: number;
}): Promise<{
    success: boolean;
    data: IGetBranchResponse | null;
    message?: string;
}> {
    return executeApiRequest<IGetBranchResponse>('post', 'getbranch', payload);
}

/**
 * Fetch semesters by Branch, Course & Year
 */
export async function getSemestersByBranch(payload: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
}): Promise<{
    success: boolean;
    data: IGetSemesterResponse | null;
    message?: string;
}> {
    return executeApiRequest<IGetSemesterResponse>('post', 'getsemester', payload);
}

/**
 * Fetch sections & subject groups by Semester, Branch, Course & Year
 */
export async function getSectionsBySemester(payload: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
}): Promise<{
    success: boolean;
    data: IGetSectionResponse | null;
    message?: string;
}> {
    return executeApiRequest<IGetSectionResponse>('post', 'getsection', payload);
}

/**
 * Search student details for mapping
 */
export async function searchStudentDetails(payload: IStudentDetailsSearchPayload): Promise<{
    success: boolean;
    data: IStudentDetailsResponse | null;
    message?: string;
}> {
    return executeApiRequest<IStudentDetailsResponse>('post', 'Studentdetails', payload);
}

/**
 * Save / Update student subject mapping details
 */
export async function saveMappingDetails(payload: ISaveMappingPayload): Promise<{
    success: boolean;
    data: ISaveMappingResponse | null;
    message?: string;
}> {
    return executeApiRequest<ISaveMappingResponse>('post', 'savedetails', payload);
}
