'use server';

import { api } from '@/lib/apiService';
import type { ISectionDropdown } from '@/types/timetable/TTreports';
import type { ITimeTableCategoryDropDownData } from '@/types/timetable/masters/masters';

// Class Wise TimeTable Report
export const getClassWiseReportDetails = async (data: any) => {
    return await api.get<any>('timetable', 'ClassWiseTT/getdetails');
};

// export const getClassWiseReport = async (data: any) => {
//     return await api.post<any>('timetable', 'ClassWiseTTFacade/ClassWiseTTreport', data);
// };

export async function getClassWiseReport(data: any) {
    const url = '/ClassWiseTTFacade/ClassWiseTTreport';
    return await api.post<any>('timetable', url, data);
}

export const getClassByCategory = async (data: any) => {
    return await api.post<any>('timetable', 'ClassWiseTT/getclass_catg', data);
};

export async function getSectionDetailsTT() {
    console.log('Fetching section details for TT');
    const url = '/TimeTableCommon/section-details';
    return await api.get<ISectionDropdown[]>('timetable', url);
}

export async function getClassDetails() {
    const url = '/TimeTableCommon/GetClassData';
    return await api.get<any[]>('timetable', url);
}

export async function getTimeTableCategoryDropDownDetails() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    console.info('MasterDayFacade', url);
    return await api.get<ITimeTableCategoryDropDownData[]>('timetable', url);
}
