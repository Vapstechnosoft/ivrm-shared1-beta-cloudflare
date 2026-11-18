'use server';

import { api } from '@/lib/apiService';
import type { IstaffLoadDataTTStaffReport } from '@/types/timetable/TTreports';

// Staff Wise TimeTable Report
export const getStaffWiseDetails = async (data: any) => {
    return await api.get<any>('timetable', 'StaffWiseTT/getdetails');
};

export const getStaffWiseReport = async (data: any) => {
    return await api.post<any>('timetable', 'StaffWiseTT/getrpt', data);
};

export const getStaffWiseReportUsingFacade = async (data: any) => {
    return await api.post<any>('timetable', 'StaffWiseTTFacade/StaffWiseTTreport', data);
};

export async function getstaffdropdowndatattstaffreport() {
    const url = '/StaffWiseTTFacade/GetStaffDropDown';
    return await api.get<IstaffLoadDataTTStaffReport[]>('timetable', url);
}
