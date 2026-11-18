'use server';

import { api } from '@/lib/apiService';

export async function getOralTestMarksInitialData() {
    const response = await api.get<any>('preadmission', '/OralTestMarksEntry/Getdata');
    return response.data;
}

export async function getOralTestMarksStudents(paotsId: number) {
    const response = await api.post<any>('preadmission', `/OralTestMarksEntry/GetdetailsOnSchedule?PAOTS_Id=${paotsId}`);
    return response.data;
}

export async function getOralTestMarksGrid(data: {
    paotM_Id: number;
    oralTestByPerson: string | number;
    selectedStudentDetails: any[];
}) {
    const response = await api.post<any>('preadmission', '/OralTestMarksEntry/GetOralTestMarks', data);
    return response.data;
}

export async function saveOralTestMarks(data: {
    paotM_Id: number;
    paotS_Id: number;
    oralTestScheduleAppFlag: string;
    selectedStudentMarksData: any[];
}) {
    const response = await api.post<any>('preadmission', '/OralTestMarksEntry/OralTestMarksEntryData', data);
    return response.data;
}
