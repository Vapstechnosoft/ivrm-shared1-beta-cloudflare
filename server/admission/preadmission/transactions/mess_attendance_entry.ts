'use server';

import { api } from '@/lib/apiService';

export async function getMessAttendanceLoadData(portalType?: string) {
    const url = portalType
        ? `/StudentAttendanceEntry/getinitialdata?stringmobileorportal=${portalType}`
        : '/StudentAttendanceEntry/getinitialdata';
    const res = await api.get<any>('admission', url);
    return res?.data || res;
}

export async function getStudentData(data: {
    asmay_Id: number;
    asmcl_Id: number;
    asmS_Id: number;
    asamdM_Entry_DateTime: string;
    monthflag: string;
    monthflag1: string;
    classsecflag: string;
    checksubject: string;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/getstudentdata', data);
    return res?.data || res;
}

export async function getStudents(data: {
    asmay_Id: number;
    asmcl_Id: number;
    asmS_Id: number;
    asamdM_Entry_DateTime: string;
    monthflag: string;
    monthflag1: string;
    classsecflag: string;
    checksubject: string;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/GetStudents', data);
    return res?.data || res;
}

export async function getMonthClassHeld(data: {
    asmay_Id: number;
    asmcl_Id: number;
    asmS_Id: number;
    monthid: number;
    monthflag: string;
    monthflag1: string;
    asamdM_Entry_DateTime: string;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/getmonthclassheld', data);
    return res?.data || res;
}

export async function getDatewiseAttMDM(data: {
    asmay_Id: number;
    asmcl_Id: number;
    asmS_Id: number;
    asamdM_Entry_DateTime: string;
    monthflag: string;
    monthid: number;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/getdatewiseattMDM', data);
    return res?.data || res;
}

export async function getBatchList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ismS_Id: number;
}) {
    const res = await api.post<any>(
        'admission',
        `/StudentAttendanceEntry/getbatchlist?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}&ismS_Id=${data.ismS_Id}`
    );
    return res?.data || res;
}

export async function getStdListPeriod(data: {
    asmay_Id: number;
    asmcl_Id: number;
    asmS_Id: number;
    ismS_Id: number;
    ttmP_Id: number;
    monthflag: string;
    monthflag1: string;
    asamdM_Entry_DateTime: string;
    asasB_Id: number;
}) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/getstdlistperiod', data);
    return res?.data || res;
}

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
    const res = await api.post<any>('admission', url);
    return res?.data || res;
}

export async function saveMessStudentAttendance(data: any) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/SaveMessStudentAttendance', data);
    return res?.data || res;
}

export async function deleteAttendance(data: any) {
    const res = await api.post<any>('admission', '/StudentAttendanceEntry/Deleteattendance', data);
    return res?.data || res;
}

export async function attendanceDeleteRecordWise(data: {
    ASA_Id: number;
}) {
    const res = await api.post<any>('admission', `/StudentAttendanceEntry/AttendanceDeleteRecordWise?asaId=${data.ASA_Id}`);
    return res?.data || res;
}
