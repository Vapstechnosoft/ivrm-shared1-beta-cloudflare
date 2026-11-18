'use server';

import { api } from '@/lib/apiService';

/**
 * Get details to bind year list, class list, section list, student list, grade list.
 */
export async function getHHSReportPreparatoryDetails() {
    const url = '/HHSReport_5to7/Getdetails';
    return await api.get<any>('exam', url);
}

/**
 * Get class list by academic year.
 */
export async function getClassByYear(asmaY_Id: number) {
    if (!asmaY_Id) throw new Error('Academic Year ID is required');
    const url = `/HHSReport_5to7/getclass/${asmaY_Id}`;
    return await api.get<any>('exam', url);
}

/**
 * Get section list by class and academic year.
 */
export async function getSectionByClass(data: { ASMCL_Id: number; ASMAY_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    const url = '/HHSReport_5to7/Getsection';
    return await api.post<any>('exam', url, data);
}

/**
 * Get student attendance and list by section, class and academic year.
 */
export async function getAttendanceBySection(data: { ASMCL_Id: number; ASMAY_Id: number; ASMS_Id: number }) {
    if (!data.ASMCL_Id) throw new Error('Class ID is required');
    if (!data.ASMAY_Id) throw new Error('Academic Year ID is required');
    if (!data.ASMS_Id) throw new Error('Section ID is required');
    const url = '/HHSReport_5to7/GetAttendence';
    return await api.post<any>('exam', url, data);
}

/**
 * Get primary report card details.
 */
export async function getPrimarySaveDetails(data: any) {
    try {
        const url = '/HutchingReports/Get_primary_savedetails';
        const response = await api.post<any>('exam', url, data);
        return response;
    } catch (error) {
        console.error('getPrimarySaveDetails error:', error);
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}
