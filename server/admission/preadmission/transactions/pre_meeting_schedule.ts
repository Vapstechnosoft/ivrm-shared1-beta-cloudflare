'use server';

import { api } from '@/lib/apiService';

export async function getEmpDetails() {
    const url = '/pre_live_meeting_schedule/getempdetails';
    return await api.get<any>('preadmission', url);
}

export async function endMainMeeting(data: any) {
    const url = '/pre_live_meeting_schedule/endmainmeeting';
    return await api.post<any>('preadmission', url, data);
}

export async function saveRemarks(data: any) {
    const url = '/pre_live_meeting_schedule/saveremarks';
    return await api.post<any>('preadmission', url, data);
}

export async function onStartMeeting(data: any) {
    const url = '/pre_live_meeting_schedule/onstartmeeting';
    return await api.post<any>('preadmission', url, data);
}

export async function joinMeeting(data: any) {
    const url = '/pre_live_meeting_schedule/joinmeeting';
    return await api.post<any>('preadmission', url, data);
}

export async function onDateChange(data: any) {
    const url = '/pre_live_meeting_schedule/ondatechange';
    return await api.post<any>('preadmission', url, data);
}

export async function onScheduleChange(data: any) {
    const url = '/pre_live_meeting_schedule/onschedulecahnge';
    return await api.post<any>('preadmission', url, data);
}

export async function getEmployeeDetailsBySelection(data: any) {
    const url = '/pre_live_meeting_schedule/getEmployeedetailsBySelection';
    return await api.post<any>('preadmission', url, data);
}

export async function getDepts(data: any) {
    const url = '/pre_live_meeting_schedule/get_depts';
    return await api.post<any>('preadmission', url, data);
}

export async function getDesig(data: any) {
    const url = '/pre_live_meeting_schedule/get_desig';
    return await api.post<any>('preadmission', url, data);
}

export async function filterEmployeeDetailsBySelection(data: any) {
    const url = '/pre_live_meeting_schedule/filterEmployeedetailsBySelection';
    return await api.post<any>('preadmission', url, data);
}

export async function getStudentDocsOnly(data: any) {
    const url = '/document_view/getdocksonly';
    return await api.post<any>('preadmission', url, data);
}
