'use server';

import { api } from '@/lib/apiService';

export async function getWrittenTestMarksInitialData() {
    const response = await api.get<any>('preadmission', '/WrittenTestMarksEntry/GetWrittenTestMarksEntryData');
    return response.data;
}

export async function getWrittenTestMarksStudents(pawtsId: number) {
    const response = await api.post<any>('preadmission', `/WrittenTestMarksEntry/GetdetailsOnSchedule?PAWTS_Id=${pawtsId}`);
    return response.data;
}

export async function getWrittenTestMarksGrid(data: {
    ismS_Id: number | string;
    selectedStudentDetails: { pasR_Id: number }[];
}) {
    const response = await api.post<any>('preadmission', '/WrittenTestMarksEntry/GetWrittenTestMarks', data);
    return response.data;
}

export async function saveWrittenTestMarks(data: {
    paswM_Id: number;
    pawtS_Id: number;
    writtenTestScheduleAppFlag: string | boolean;
    selectedStudentMarksData: {
        pasR_Id: number;
        ismS_Id: number;
        obtMarks: number;
    }[];
}) {
    const response = await api.post<any>('preadmission', '/WrittenTestMarksEntry/SaveWrittenTestMarksEntryData', data);
    return response.data;
}
