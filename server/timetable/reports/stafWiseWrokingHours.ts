'use server';

import { api } from '@/lib/apiService';

export async function getstaffwiseWorkingHoursStaffDD() {
    const url = '/TimeTableCommon/TTStaffHoursDetails';
    console.info('Fetching staff working hours report data from URL:', url);

    return await api.get<any>('timetable', url);
}

export async function getstaffwiseWorkingHoursReport(data: any) {
    const { asmaY_Id, staffarray } = data;

    // Based on Swagger: ASMAY_Id (int) and HRME_Ids (string, comma-separated)
    const hrmeIds = Array.isArray(staffarray)
        ? staffarray
              .map((s: any) => s.hrmE_Id ?? s.HRME_Id)
              .filter(Boolean)
              .join(',')
        : '';

    const url = `/TimeTableCommon/TTStaffHoursReport?ASMAY_Id=${asmaY_Id}&HRME_Ids=${hrmeIds}`;

    console.info('Fetching staff working hours report data from URL:', url);
    return await api.get<any>('timetable', url);
}

export async function getstaffwiseWorkingHoursAcademicYear() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('Fetching staff working hours report data from URL:', url);

    return await api.get<any[]>('timetable', url);
}
