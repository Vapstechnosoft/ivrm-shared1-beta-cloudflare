'use server';

import { api } from '@/lib/apiService';

/**
 * Get initial details for HHSReport_10th
 */
export async function getHHSReport10thDetails() {
    const url = '/HHSReport_10th/Getdetails';
    return await api.get<any>('exam', url);
}

/**
 * Get class list by academic year.
 */
export async function getHHSReport10thClassByYear(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    try {
        const url = '/HHSReport_10th/getclass';
        const response = await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id });
        return response;
    } catch (error) {
        console.error('getHHSReport10thClassByYear error:', error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Get section list by class and academic year.
 */
export async function getHHSReport10thSectionByClass(data: { ASMCL_Id: number; ASMAY_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    const url = '/HHSReport_10th/Getsection';
    return await api.post<any>('exam', url, data);
}

/**
 * Get student list by section, class and academic year.
 */
export async function getHHSReport10thStudent(data: { ASMCL_Id: number; ASMAY_Id: number; ASMS_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    if (!data.ASMS_Id) throw new Error('Section ID is required');
    const url = '/HHSReport_10th/GetStudent';
    return await api.post<any>('exam', url, data);
}

/**
 * Get 10th report card details (save details).
 */
export async function getHHSReport10thSaveDetails(data: any) {
    try {
        const url = '/HutchingReports/savedetails';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch (error) {
        console.error('getHHSReport10thSaveDetails error:', error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}
