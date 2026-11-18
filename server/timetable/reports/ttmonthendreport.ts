'use server';

import { api } from '@/lib/apiService';

export async function getTTMonthEndReportDetails() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('TTMonthEndReportDetails', url);
    return await api.get<any>('timetable', url);
}

export async function getTTMonthEndReport(data: { month: number; ASMAY_ID: number; year?: number }) {
    const url = '/TTConsolidatedFacade/MonthEndReportTT';
    console.info('TTMonthEndReport', url);
    return await api.post<any>('timetable', url, data);
}
