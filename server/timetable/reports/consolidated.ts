'use server';

import { api } from '@/lib/apiService';

// Consolidated Report
export const getConsolidatedReportDetails = async (data: any) => {
    return await api.get<any>('timetable', '/TTConsolidatedFacade/getalldetails');
};

export const getConsolidatedReport = async (data: any) => {
    return await api.post<any>('timetable', '/TTConsolidatedFacade/GetConsoliDatedTT', data);
};

// export async function getClassDetails() {
//     const url = '/TimeTableCommon/GetClassData';
//     return await api.get<any[]>('timetable', url);
// }
