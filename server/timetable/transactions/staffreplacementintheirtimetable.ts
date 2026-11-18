'use server';

import { api } from '@/lib/apiService';
import type { Staff, StaffReplacementReportResponse } from '@/types/timetable/Transaction/staffreplacementintheirtimetable';

export async function getStaffDetails() {
    const url = '/TimeTableCommon/GetStaffDetails';
    console.info('TimeTableCommon', url);
    return await api.get<Staff[]>('timetable', url);
}

export async function getStaffReplacementExistingToNewMasters() {
    const response = await getStaffDetails();
    return {
        staff: response.data || []
    };
}

export async function getStaffReplacementReport(payload: { hrmE_Id: string }) {
    const url = '/StaffReplacementInTheirTTFacade/TTStaffReplacementInTheirTTReport';
    console.info('StaffReplacementInTheirTTFacade', url);
    return await api.post<StaffReplacementReportResponse>('timetable', url, payload);
}

export async function saveStaffReplacement(payload: any) {
    const url = '/StaffReplacementInTheirTTFacade/savedetail';
    console.info('StaffReplacementInTheirTTFacade', url);
    return await api.post<any>('timetable', url, payload);
}

export async function getPossiblePeriods(payload: any) {
    const url = '/StaffReplacementInTheirTTFacade/getpossiblePeriod';
    console.info('StaffReplacementInTheirTTFacade', url);
    return await api.post<any>('timetable', url, payload);
}
