'use server';

import { api } from '@/lib/apiService';
import type { SectionDropDownDataTT } from '@/types/timetable/TTreports';
import type { ITimeTableClassDropDownData } from '@/types/timetable/masters/masters';

// Subject Wise TimeTable Report
export const getSubjectWiseDetails = async (data: any) => {
    return await api.get<any>('timetable', 'Subjectwise/getdetails');
};

export const getSubjectWiseReport = async (data: any) => {
    return await api.post<any>('timetable', 'SubjectwiseFacade/SubjectfWiseTTreport', data);
};

export async function getuseTimeTableClassDropdownData() {
    const url = '/TimeTableCommon/GetClassData';
    console.info('MasterDayFacade', url);
    return await api.get<ITimeTableClassDropDownData[]>('timetable', url);
}

export async function getuseTimeTableSectionDropdownData() {
    const url = '/TimeTableCommon/section-details';
    console.info('MasterDayFacade', url);
    return await api.get<SectionDropDownDataTT[]>('timetable', url);
}
