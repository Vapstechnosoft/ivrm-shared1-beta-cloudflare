'use server';

import { api } from '@/lib/apiService';

/**
 * Get initial details for HHSReport_5to7
 */
export async function getHHSReport5to7Details() {
    const url = '/HHSReport_5to7/Getdetails';
    return await api.get<any>('exam', url);
}

/**
 * Get class list by academic year.
 */
export async function getHHSReport5to7ClassByYear(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    try {
        const url = '/HHSReport_5to7/getclass';
        const response = await api.post<any>('exam', url, { ASMAY_Id: asmaY_Id });
        return response;
    } catch (error) {
        console.error('getHHSReport5to7ClassByYear error:', error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Get section list by class and academic year.
 */
export async function getHHSReport5to7SectionByClass(data: { ASMCL_Id: number; ASMAY_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    const url = '/HHSReport_5to7/Getsection';
    return await api.post<any>('exam', url, data);
}

/**
 * Get student list by section, class and academic year.
 */
export async function getHHSReport5to7Student(data: { ASMCL_Id: number; ASMAY_Id: number; ASMS_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    if (!data.ASMS_Id) throw new Error('Section ID is required');
    const url = '/HHSReport_5to7/GetStudent';
    return await api.post<any>('exam', url, data);
}

/**
 * Get 5to7 report card details (save details).
 */
export async function getHHSReport5to7SaveDetails(data: any) {
    try {
        const url = '/HutchingReports/savedetails';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch (error) {
        console.error('getHHSReport5to7SaveDetails error:', error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}
