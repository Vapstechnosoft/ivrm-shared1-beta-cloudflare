'use server';

import { api } from '@/lib/apiService';
import type {
    IGetDetailsResponse,
    IIndReportPayload,
    IIndReportResponse,
    IOnChangeBranchResponse,
    IOnChangeCourseResponse,
    IOnChangeSchemeTypeResponse,
    IOnChangeSemesterResponse,
    IOnChangeSubjectSchemeResponse,
    IOnChangeYearResponse
} from './types';

// Helper to execute API requests with endpoint casing fallbacks
async function executeApiRequest<T>(
    method: 'get' | 'post',
    subPath: string,
    data?: any
): Promise<{ success: boolean; data: T | null; message?: string }> {
    const endpoints = [
        `/CollegeCumulativeAvgBestReport/${subPath}`.replace(/\/+/g, '/'),
        `/collegecumulativeavgbestreport/${subPath}`.replace(/\/+/g, '/'),
        `/CollegeCumulativeAvgBestReportFacade/${subPath}`.replace(/\/+/g, '/'),
        `/collegecumulativeavgbestreportfacade/${subPath}`.replace(/\/+/g, '/'),
        `/ClgCumulativeAvgBestReport/${subPath}`.replace(/\/+/g, '/'),
        `/clgcumulativeavgbestreport/${subPath}`.replace(/\/+/g, '/')
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
 * Fetch initial data (Academic years)
 */
export async function getInitialDetails(): Promise<{
    success: boolean;
    data: IGetDetailsResponse | null;
    message?: string;
}> {
    const endpoints = [
        '/CollegeCumulativeAvgBestReport/Getdetails/2',
        '/collegecumulativeavgbestreport/Getdetails/2',
        '/CollegeCumulativeAvgBestReport/Getdetails',
        '/collegecumulativeavgbestreport/Getdetails'
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

    return executeApiRequest<IGetDetailsResponse>('post', 'Getdetails', { pageid: 2 });
}

/**
 * Fetch courses by Year
 */
export async function onChangeYear(asmaY_Id: number): Promise<{
    success: boolean;
    data: IOnChangeYearResponse | null;
    message?: string;
}> {
    return executeApiRequest<IOnChangeYearResponse>('post', 'onchangeyear', {
        ASMAY_Id: asmaY_Id
    });
}

/**
 * Fetch branches by Course & Year
 */
export async function onChangeCourse(payload: {
    ASMAY_Id: number;
    AMCO_Id: number;
}): Promise<{
    success: boolean;
    data: IOnChangeCourseResponse | null;
    message?: string;
}> {
    return executeApiRequest<IOnChangeCourseResponse>('post', 'onchangecourse', payload);
}

/**
 * Fetch semesters by Branch, Course & Year
 */
export async function onChangeBranch(payload: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
}): Promise<{
    success: boolean;
    data: IOnChangeBranchResponse | null;
    message?: string;
}> {
    return executeApiRequest<IOnChangeBranchResponse>('post', 'onchangebranch', payload);
}

/**
 * Fetch sections & subject schemes by Semester, Branch, Course & Year
 */
export async function onChangeSemester(payload: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
}): Promise<{
    success: boolean;
    data: IOnChangeSemesterResponse | null;
    message?: string;
}> {
    return executeApiRequest<IOnChangeSemesterResponse>('post', 'onchangesemester', payload);
}

/**
 * Fetch scheme types by Subject Scheme, Semester, Branch, Course & Year
 */
export async function onChangeSubjectScheme(payload: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACSS_Id: number;
}): Promise<{
    success: boolean;
    data: IOnChangeSubjectSchemeResponse | null;
    message?: string;
}> {
    return executeApiRequest<IOnChangeSubjectSchemeResponse>('post', 'onchangesubjectscheme', payload);
}

/**
 * Fetch exams & subjects by Scheme Type, Section, etc.
 */
export async function onChangeSchemeType(payload: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACSS_Id: number;
    ACST_Id: number;
    ACMS_Id: number;
}): Promise<{
    success: boolean;
    data: IOnChangeSchemeTypeResponse | null;
    message?: string;
}> {
    return executeApiRequest<IOnChangeSchemeTypeResponse>('post', 'onchangeschemetype', payload);
}

/**
 * Generate Individual Subject-wise Cumulative Report
 */
export async function getIndReport(payload: IIndReportPayload): Promise<{
    success: boolean;
    data: IIndReportResponse | null;
    message?: string;
}> {
    return executeApiRequest<IIndReportResponse>('post', 'getindreport', payload);
}
