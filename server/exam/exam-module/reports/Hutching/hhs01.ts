'use server';

import { api } from '@/lib/apiService';

/**
 * Get details to bind year list, class list, section list, student list
 */
export async function getHHS01Details() {
    const url = '/HHSReport_PreNurs/Getdetails';
    return await api.get<any>('exam', url);
}

/**
 * Get class list by academic year.
 */
export async function getClassByYear(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    const url = '/HHSReport_PreNurs/getclass';
    return await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id });
}

/**
 * Get section list by class and academic year.
 */
export async function getSectionByClass(data: { ASMCL_Id: number; ASMAY_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    const url = '/HHSReport_PreNurs/Getsection';
    return await api.post<any>('exam', url, data);
}

/**
 * Get student attendance and list by section, class and academic year.
 */
export async function getAttendanceBySection(data: { ASMCL_Id: number; ASMAY_Id: number; ASMS_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    if (!data.ASMS_Id) throw new Error('Section ID is required');
    const url = '/HHSReport_PreNurs/GetAttendence';
    return await api.post<any>('exam', url, data);
}

/**
 * Save / generate details for HHS01
 */
export async function getPrimarySaveDetails(data: any) {
    try {
        const url = '/HutchingReports/hhsavedetails';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch (error) {
        console.error('getPrimarySaveDetails error:', error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}
