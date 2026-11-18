'use server';

import { api } from '@/lib/apiService';
import type { Staff } from '@/types/timetable/Transaction/staffreplacementinunallocatedperiod';

export async function getStaffDetails() {
    const url = '/TimeTableCommon/GetStaffDetails';
    console.info('TimeTableCommon', url);
    return await api.get<Staff[]>('timetable', url);
}

export async function getStaffReplacementUnallocatedPeriodNewMasters() {
    const response = await getStaffDetails();
    return {
        staff: response.data || []
    };
}

export async function getTimetableData(payload: { hrmE_Id: string }) {
    const { hrmE_Id } = payload;
    const url = `/StaffReplacementFacade/GetTimetableData/${hrmE_Id}/0`;
    console.info('StaffReplacementFacade', url);
    return await api.get<any>('timetable', url);
}

export async function TTStaffReplacementInUnallocatedPeriodReport(hrmE_Id: number) {
    const url = `/StaffReplacementInUnallocatedPeriodFacade/TTStaffReplacementInUnallocatedPeriodReport/${hrmE_Id}`;
    console.info('StaffReplacementInUnallocatedPeriodFacade', url);
    return await api.get<any>('timetable', url);
}

export async function saveStaffReplacementInUnallocatedPeriod(payload: any) {
    const url = '/StaffReplacementInUnallocatedPeriodFacade/TTStaffReplacementInUnallocatedPeriodSave';
    console.info('StaffReplacementInUnallocatedPeriodFacade', url);
    return await api.post<any>('timetable', url, payload);
}
