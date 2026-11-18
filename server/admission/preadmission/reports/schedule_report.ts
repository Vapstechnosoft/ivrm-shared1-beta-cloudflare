'use server';

import { api } from '@/lib/apiService';
import type {
    IScheduleListResponse,
    IScheduleReportDetailsResponse,
    IScheduleReportInitialDetailsResponse
} from '@/types/admission/preadmission/reports';

/**
 * Fetches the initial details (Academic Year, Class) for the Schedule Report.
 */
export async function getScheduleReportInitialDetails() {
    const url = '/ScheduleReport/get_details';
    return await api.get<IScheduleReportInitialDetailsResponse>('preadmission', url);
}

/**
 * Fetches the list of schedules based on test type and academic year.
 */
export async function getScheduleList(data: {
    oralwrittenscheduleflag: string;
    yearorbtwndates: string;
    asmay_id: number;
}) {
    const url = `/ScheduleReport/schedulelist?oralwrittenscheduleflag=${data.oralwrittenscheduleflag}&yearorbtwndates=${data.yearorbtwndates}&yearid=${data.asmay_id}`;
    return await api.post<IScheduleListResponse>('preadmission', url);
}

/**
 * Fetches the detailed schedule report based on filters.
 */
export async function getScheduleReportDetails(data: {
    asmayid: number;
    asmclid: number;
    fromdate: string;
    todate: string;
    flagows: string;
    schids: string;
    stype: number;
}) {
    const url = `/ScheduleReport/Getreportdetails?asmayid=${data.asmayid}&asmclid=${data.asmclid}&fromdate=${data.fromdate}&todate=${data.todate}&flagows=${data.flagows}&schids=${data.schids}&stype=${data.stype}`;
    return await api.post<IScheduleReportDetailsResponse>('preadmission', url);
}

/**
 * Sends/Resends schedule emails to selected students.
 */
export async function sendScheduleMail(data: {
    smsMailStudentDetailst: any[];
}) {
    const url = '/ScheduleReport/SendMail';
    return await api.post<any>('preadmission', url, data);
}
