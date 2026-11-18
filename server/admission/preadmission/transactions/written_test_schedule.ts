'use server';
import { api } from '@/lib/apiService';
import type { IWrittenTestScheduleDetails } from '@/types/admission/preadmission/transactions/written-test-schedule';

export async function getWrittenTestScheduleDetails(classId: number) {
    const response = await api.get<IWrittenTestScheduleDetails>('preadmission', `/WrittenTestSchedule/Getdetails?ASMCL_ID=${classId}`);
    return response.data || response;
}

export async function getWrittenTestStudentDetails(pawtS_Id: number) {
    const response = await api.post<any>('preadmission', `/WrittenTestSchedule/GetStudentdetails?PAWTS_Id=${pawtS_Id}`);
    return response.data || response;
}

export async function saveWrittenTestSchedule(data: any) {
    const response = await api.post<any>('preadmission', '/WrittenTestSchedule/SaveWrittenTestScheduleData', data);
    return response;
}

export async function deleteWrittenTestSchedule(id: number) {
    const response = await api.post<any>('preadmission', `/WrittenTestSchedule/WrittenTestScheduleDeletesData?PAWTS_Id=${id}`);
    return response;
}

export async function getWrittenTestSelectedRowDetails(id: number) {
    const response = await api.post<any>('preadmission', `/WrittenTestSchedule/GetSelectedRowDetails?PAWTS_Id=${id}`);
    return response.data || response;
}

export async function deleteWrittenTestScheduleStudentData(data: { PAWTS_Id: number; PASR_Id: number }) {
    const response = await api.post<any>(
        'preadmission',
        `/WrittenTestSchedule/WrittenTestScheduleDeletesStudentData?PASR_Id=${data.PASR_Id}&PAWTS_Id=${data.PAWTS_Id}`
    );
    return response;
}

export async function getWrittenTestRemainStudentDetails() {
    const response = await api.post<any>('preadmission', `/WrittenTestSchedule/GetRemainStudentdetails`);
    return response.data || response;
}
