'use server';

import { api } from '@/lib/apiService';

export async function getOverallDailyAttendanceReportInitialData() {
    const url = '/OverallAttendance/getinitialdata';
    return await api.get<any>('admission', url);
}

export async function getOverallDailyAttendanceReportDetails(data: {
    ASMAY_Id: number;
    fromdate: string;
    AMC_Id: number;
}) {
    const url = `/OverallAttendance/getAttendetails?AMC_Id=${data.AMC_Id}&ASMAY_Id=${data.ASMAY_Id}&fromdate=${data.fromdate}`;
    return await api.post<any>('admission', url);
}

export async function getOverallDailyAttendanceReportStudentDetails(data: {
    ASMCL_Id: number;
    ASMS_Id: number;
    ASMAY_Id: number;
    fromdate: string;
}) {
    const url = `/OverallAttendance/getStudentDetails?ASMAY_Id=${data.ASMAY_Id}&fromdate=${data.fromdate}&ASMCL_Id=${data.ASMCL_Id}&ASMS_Id=${data.ASMS_Id}`;
    return await api.post<any>('admission', url);
}

export async function getOverallDailyAttendanceReportStudentAllDetails(data: {
    ASMAY_Id: number;
    fromdate: string;
}) {
    const url = `/OverallAttendance/getStudentAllDetails?ASMAY_Id=${data.ASMAY_Id}&fromdate=${data.fromdate}`;
    return await api.post<any>('admission', url);
}
