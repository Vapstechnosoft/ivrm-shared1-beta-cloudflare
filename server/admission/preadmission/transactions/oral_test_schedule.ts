'use server';
import { api } from '@/lib/apiService';

export async function getOralTestScheduleDetails() {
    const response = await api.get<any>('preadmission', '/OralTestSchedule/Getdata');
    return response.data;
}

export async function getClasswiseStudent(classId: number) {
    const response = await api.post<any>('preadmission', `/OralTestSchedule/classwisestudent?ASMCL_ID=${classId}`);
    return response.data;
}

export async function getStudentDetails(pasrId: number) {
    const response = await api.post<any>('preadmission', `/OralTestSchedule/GetStudent_details?pasr_id=${pasrId}`);
    return response.data;
}

export async function saveOralTestSchedule(data: any) {
    const response = await api.post<any>('preadmission', '/OralTestSchedule/SaveOral_test', data);
    return response.data;
}

export async function deleteOralTestSchedule(id: number) {
    const response = await api.post<any>('preadmission', `/OralTestSchedule/OralTestSchedule_DeletesData?PAOTS_Id=${id}`);
    return response.data;
}

export async function getSelectedRowDetails(id: number) {
    const response = await api.post<any>('preadmission', `/OralTestSchedule/GetSelected_RowDetails?PAOTS_Id=${id}`);
    return response.data;
}

export async function deleteOralTestScheduleStudentData(paotsId: number, pasrId: number) {
    const response = await api.delete<any>(
        'preadmission',
        `/OralTestSchedule/OralTestSchedule_DeletesStudentData?PASR_Id=${pasrId}&PAOTS_Id=${paotsId}`
    );
    return response.data;
}

export async function getScheduleReportDetails(paotsId: number) {
    const response = await api.post<any>('preadmission', `/ScheduleReport/scheduleGetreportdetails?PAOTS_Id=${paotsId}`);
    return response.data;
}

export async function getRemarksReportDetails(paotsId: number) {
    const response = await api.get<any>('preadmission', `/ScheduleReport/remarksGetreportdetails?PAOTS_Id=${paotsId}`);
    return response.data;
}

export async function checkAddParticipants(data: any) {
    const response = await api.post<any>('preadmission', '/OralTestSchedule/checkaddparticipants', data);
    return response.data;
}

export async function removeStudents(students: any[]) {
    const response = await api.post<any>('preadmission', '/OralTestSchedule/removestudents', { DeleteStudentData: students });
    return response.data;
}

export async function sendReminder(data: any) {
    const response = await api.post<any>('preadmission', '/OralTestSchedule/ReseOralTest_ScheduleData', data);
    return response.data;
}
