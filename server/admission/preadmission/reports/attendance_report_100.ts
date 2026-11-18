'use server';

import { api } from '../../../../lib/apiService';

export async function getAttendance100InitialDetails(data: any) {
    const { categoryflag, ASMAY_Id } = data;
    return await api.post<any>('admission', `/AttendanceReport/getinitialdata?categoryflag=${categoryflag}&ASMAY_Id=${ASMAY_Id}`);
}

export async function getAttendance100Class(data: any) {
    const { ASMAY_Id, AMC_Id } = data;
    return await api.post<any>('admission', `/AttendanceReport/getclass?ASMAY_Id=${ASMAY_Id}&AMC_Id=${AMC_Id}`);
}

export async function getAttendance100Section(data: any) {
    const { ASMAY_Id, ASMCL_Id } = data;
    return await api.post<any>('admission', `/AttendanceReport/getsection?ASMAY_Id=${ASMAY_Id}&ASMCL_Id=${ASMCL_Id}`);
}

export async function getAttendance100Report(data: any) {
    if (!data) return null;
    const { type, ASMAY_Id, ASMCL_Id, ASMC_Id, AMC_Id, percentage } = data;
    return await api.post<any>(
        'admission',
        `/AttendanceReport/searchdata?type=${type}&ASMAY_Id=${ASMAY_Id}&ASMCL_Id=${ASMCL_Id}&ASMC_Id=${ASMC_Id}&AMC_Id=${AMC_Id}&percentage=${percentage}`
    );
}

export async function sendShortageAlert(asmaY_Id: number) {
    return await api.post<any>('admission', `/AttendanceReport/shortageOfAttendanceAlert?ASMAY_Id=${asmaY_Id}`);
}
