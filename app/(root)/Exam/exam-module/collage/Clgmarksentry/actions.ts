'use server';

import { api } from '@/lib/apiService';
import type {
    IClgMarksEntryBranchesResponse,
    IClgMarksEntryCoursesResponse,
    IClgMarksEntryExamsResponse,
    IClgMarksEntryInitialDataResponse,
    IClgMarksEntrySavePayload,
    IClgMarksEntrySaveResponse,
    IClgMarksEntrySchemeTypeResponse,
    IClgMarksEntrySearchResponse,
    IClgMarksEntrySemestersResponse,
    IClgMarksEntrySubjectSchemeResponse,
    IClgMarksEntrySubjectsResponse
} from './types';

// Helper to execute API requests with robust endpoint casing fallbacks
async function executeApiRequest<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    subPath: string,
    data?: any
): Promise<{ success: boolean; data: T | null; message?: string }> {
    const endpoints = [
        `/ClgMarksEntry/${subPath}`.replace(/\/+/g, '/'),
        `/ClgMarksEntryFacade/${subPath}`.replace(/\/+/g, '/'),
        `/clgmarksentry/${subPath}`.replace(/\/+/g, '/'),
        `/clgmarksentryfacade/${subPath}`.replace(/\/+/g, '/')
    ];

    let lastError: any = null;
    for (const endpoint of endpoints) {
        try {
            let res: any;
            if (method === 'get') {
                res = await api.get<T>('exam', endpoint);
            } else if (method === 'post') {
                res = await api.post<T>('exam', endpoint, data);
            } else if (method === 'put') {
                res = await api.put<T>('exam', endpoint, data);
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
        message: lastError?.message || lastError?.response?.data?.message || 'API request failed',
        data: null
    };
}

/**
 * 1. Get initial data (Academic Years)
 * Endpoint: ClgMarksEntry/getalldetails
 */
export async function getClgMarksEntryInitialData() {
    let result = await executeApiRequest<IClgMarksEntryInitialDataResponse>('get', 'getalldetails');
    if (!result.success) {
        result = await executeApiRequest<IClgMarksEntryInitialDataResponse>('post', 'getalldetails', {});
    }
    return result;
}

/**
 * 2. On change Academic Year -> fetch Courses
 * Endpoint: ClgMarksEntry/onchangeyear
 */
export async function onClgMarksEntryChangeYear(asmaY_Id: number) {
    return await executeApiRequest<IClgMarksEntryCoursesResponse>('post', 'onchangeyear', {
        ASMAY_Id: asmaY_Id
    });
}

/**
 * 3. On change Course -> fetch Branches
 * Endpoint: ClgMarksEntry/onchangecourse
 */
export async function onClgMarksEntryChangeCourse(asmaY_Id: number, amcO_Id: number) {
    return await executeApiRequest<IClgMarksEntryBranchesResponse>('post', 'onchangecourse', {
        ASMAY_Id: asmaY_Id,
        AMCO_Id: amcO_Id
    });
}

/**
 * 4. On change Branch -> fetch Semesters
 * Endpoint: ClgMarksEntry/onchangebranch
 */
export async function onClgMarksEntryChangeBranch(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    marksbranch: { AMB_Id: number }[];
}) {
    return await executeApiRequest<IClgMarksEntrySemestersResponse>('post', 'onchangebranch', data);
}

/**
 * 5. On change Semester -> fetch Exams & Sections
 * Endpoint: ClgMarksEntry/get_exams
 */
export async function getClgMarksEntryExams(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMSE_Id: number;
    marksbranch: { AMB_Id: number }[];
}) {
    return await executeApiRequest<IClgMarksEntryExamsResponse>('post', 'get_exams', data);
}

/**
 * 6. On change Exam / Sections -> fetch Subjects
 * Endpoint: ClgMarksEntry/get_subjects
 */
export async function getClgMarksEntrySubjects(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMSE_Id: number;
    marksbranch: { AMB_Id: number }[];
    markssection: { ACMS_Id: number }[];
}) {
    return await executeApiRequest<IClgMarksEntrySubjectsResponse>('post', 'get_subjects', data);
}

/**
 * 7. On change Subject -> fetch Subject Scheme
 * Endpoint: ClgMarksEntry/getsubjectscheme
 */
export async function getClgMarksEntrySubjectScheme(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMSE_Id: number;
    marksbranch: { AMB_Id: number }[];
    markssection: { ACMS_Id: number }[];
    ISMS_Id: number;
    EME_Id: number;
}) {
    return await executeApiRequest<IClgMarksEntrySubjectSchemeResponse>('post', 'getsubjectscheme', data);
}

/**
 * 8. On change Subject Scheme -> fetch Scheme Type
 * Endpoint: ClgMarksEntry/getsubjectschemetype
 */
export async function getClgMarksEntrySubjectSchemeType(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMSE_Id: number;
    marksbranch: { AMB_Id: number }[];
    markssection: { ACMS_Id: number }[];
    ISMS_Id: number;
    ACSS_Id: number;
    EME_Id: number;
}) {
    return await executeApiRequest<IClgMarksEntrySchemeTypeResponse>('post', 'getsubjectschemetype', data);
}

/**
 * 9. Search Students for Marks Entry
 * Endpoint: ClgMarksEntry/onsearch
 */
export async function searchClgMarksEntryStudents(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMSE_Id: number;
    marksbranch: { AMB_Id: number }[];
    markssection: { ACMS_Id: number }[];
    EME_Id: number;
    ISMS_Id: number;
    ACSS_Id: number;
    ACST_Id: number;
}) {
    return await executeApiRequest<IClgMarksEntrySearchResponse>('post', 'onsearch', data);
}

/**
 * 10. Save / Update Marks
 * Endpoint: ClgMarksEntry/SaveMarks
 */
export async function saveClgMarksEntry(payload: IClgMarksEntrySavePayload) {
    return await executeApiRequest<IClgMarksEntrySaveResponse>('post', 'SaveMarks', payload);
}
