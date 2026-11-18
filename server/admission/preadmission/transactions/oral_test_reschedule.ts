'use server';
import { api } from '@/lib/apiService';

export async function getOralReScheduleDetails(classId: number) {
    const response = await api.get<any>('preadmission', `/OralTestReSchedule/Getdetails?ASMCL_ID=${classId}`);
    return response;
}

export async function getReScheduleReportDetails(schids: string) {
    const response = await api.post<any>('preadmission', `/OralTestReSchedule/Getreportdetails?schids=${schids}`, {});
    return response;
}

export async function getReScheduleStudentDetails(pasrId: number) {
    const response = await api.post<any>('preadmission', `/OralTestReSchedule/GetStudentdetails?pasr_id=${pasrId}`, {});
    return response;
}

export async function getReScheduleSelectedRowDetails(paotsId: number) {
    const response = await api.post<any>('preadmission', `/OralTestReSchedule/GetSelectedRowDetails?PAOTS_Id=${paotsId}`, {});
    return response;
}

export async function deleteReScheduleStudent(paotsId: number, pasrId: number) {
    const response = await api.post<any>(
        'preadmission',
        `/OralTestReSchedule/OralTestScheduleDeletesStudentData?PASR_Id=${pasrId}&PAOTS_Id=${paotsId}`,
        {}
    );
    return response;
}

export async function deleteOralReSchedule(id: number) {
    const response = await api.post<any>('preadmission', `/OralTestReSchedule/OralTestScheduleDeletesData?PAOTS_Id=${id}`, {});
    return response;
}

export async function saveOralReSchedule(data: any) {
    const response = await api.post<any>('preadmission', '/OralTestReSchedule/SaveOraltest', data);
    return response;
}
