'use server';

import { api } from '@/lib/apiService';

export async function getConstraintReport(data: any) {
    const url = '/ConstraintReportFacade/getpagedetails';
    return await api.post<any>('timetable', url, data);
}
