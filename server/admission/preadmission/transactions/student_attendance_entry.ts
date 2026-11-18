'use server';

import { type ApiResponse, api } from '@/lib/apiService';

const BASE_URL = '/StudentAttendanceEntry';

/**
 * Loads initial data for Student Attendance Entry.
 */
export async function getInitialData(portalType?: string) {
    const url = portalType
        ? `/StudentAttendanceEntry/getinitialdata?stringmobileorportal=${portalType}`
        : '/StudentAttendanceEntry/getinitialdata';
    return await api.get<any>('admission', url);
}

/**
 * Gets student data based on criteria (Class/Section/Year).
 */
export async function getStudentData(data: {
    asmaY_Id?: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    asa_FromDate?: string;
    monthflag?: string;
    monthflag1?: string;
    classsecflag?: string;
    checksubject?: string;
    monthid?: number;
    ismS_Id?: number;
    ttmP_Id?: number;
    ASMAY_Id?: number;
    ASMCL_Id?: number;
    ASMS_Id?: number;
    [key: string]: any;
}) {
    return await api.post<any>('admission', '/StudentAttendanceEntry/getstudentdata', data);
}

/**
 * Gets month class held for monthly attendance.
 */
export async function getMonthClassHeld(data: {
    asmay_Id: number;
    asmcl_Id: number;
    asmS_Id: number;
    monthid: number;
    monthflag: string;
    monthflag1: string;
    asamdM_Entry_DateTime: string;
}) {
    return await api.post<any>('admission', '/StudentAttendanceEntry/getmonthclassheld', data);
}

/**
 * Gets date wise attendance details.
 */
export async function getDateWiseAttendance(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    monthflag: string;
    monthflag1: string;
    asa_FromDate: string;
    monthid: number;
}) {
    return await api.post<any>('admission', '/StudentAttendanceEntry/getdatewiseatt', data);
}

/**
 * Gets batch list for a subject.
 */
export async function getBatchList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ismS_Id: number;
}) {
    return await api.post<any>(
        'admission',
        `/StudentAttendanceEntry/getbatchlist?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&ismS_Id=${data.ismS_Id}`
    );
}

/**
 * Gets student list for period wise attendance.
 */
export async function getStdListPeriod(data: {
    asmay_Id: number;
    asmcl_Id: number;
    asmS_Id: number;
    ismS_Id: number;
    ttmP_Id: number;
    monthflag: string;
    monthflag1: string;
    att_entry_type: string;
    asasB_Id: number;
}) {
    return await api.post<any>('admission', '/StudentAttendanceEntry/getstdlistperiod', data);
}

/**
 * Saves student attendance entry.
 */
export async function saveAttendance(payload: any): Promise<ApiResponse<any>> {
    return await api.post('admission', '/StudentAttendanceEntry/SaveStudentAttendance', payload);
}

/**
 * Views attendance details staff wise.
 */
export async function viewAttendanceDetailsStaffWise(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    att_entry_type: string;
}) {
    let url = `/StudentAttendanceEntry/ViewAttendanceDetailsStaffWise?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    if (data.att_entry_type) {
        url += `&att_entry_type=${data.att_entry_type}`;
    }
    return await api.post<any>('admission', url);
}

/**
 * Deletes attendance for a criteria.
 */
export async function deleteAttendance(data: any) {
    return await api.post<any>('admission', '/StudentAttendanceEntry/Deleteattendance', data);
}

export async function deleteAttendanceRecordWise(data: {
    ASA_Id: number;
}) {
    return await api.post<any>('admission', `/StudentAttendanceEntry/AttendanceDeleteRecordWise?asaId=${data.ASA_Id}`);
}
