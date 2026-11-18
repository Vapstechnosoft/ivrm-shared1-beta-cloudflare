'use server';

import { api } from '@/lib/apiService';

export async function getEmpDetails() {
    const url = '/PreLiveMeetingSchedule/getempdetails';
    return await api.post<any>('preadmission', url);
}

export async function onDateChange(payload: any) {
    const url = `/PreLiveMeetingSchedule/ondatechange?ASMAY_Id=${payload.ASMAY_Id}&LMSLMEET_PlannedDate=${payload.LMSLMEET_PlannedDate}`;
    return await api.post<any>('preadmission', url, payload);
}

export async function onScheduleChange(payload: any) {
    const query = new URLSearchParams(payload).toString();
    const url = `/PreLiveMeetingSchedule/onschedulecahnge?${query}`;
    return await api.post<any>('preadmission', url, payload);
}

export async function onStartMeeting(payload: { lmslmeeT_Id: number; lmslmeeT_MeetingId: string; lmslmeeT_MeetingTopic: string }) {
    const url = '/PreLiveMeetingSchedule/onstartmeeting';
    return await api.post<any>('preadmission', url, payload);
}

export async function joinMeeting(payload: any) {
    const url = '/PreLiveMeetingSchedule/joinmeeting';
    return await api.post<any>('preadmission', url, payload);
}

export async function endMainMeeting(payload: { lmslmeeT_Id: number; hrmL_LeaveType: string }) {
    const url = '/PreLiveMeetingSchedule/endmainmeeting';
    return await api.post<any>('preadmission', url, payload);
}

export async function saveRemarks(payload: { lmslmeeT_Id: number; remarks: string; grade: string }) {
    const url = '/PreLiveMeetingSchedule/saveremarks';
    return await api.post<any>('preadmission', url, payload);
}

export async function getPrintData(pasrId: number) {
    const url = `/StudentApplication/getprintdata/${pasrId}`;
    return await api.get<any>('preadmission', url);
}
