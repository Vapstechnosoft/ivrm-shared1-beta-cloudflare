'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/CollegeDailyAttendance';

/**
 * Loads initial data for College Overall Daily Attendance Report
 */
export async function getCollegeOverallDailyAttendanceInitialData() {
    try {
        const url = '/CollegeDailyAttendance/getdetails';
        return await api.get<any>('college', url);
    } catch (error) {
        console.error('[Server] getCollegeOverallDailyAttendanceInitialData error:', error);
        return { success: false, message: 'Failed to load initial details', acdlist: [], academicListdefault: [] } as any;
    }
}

export interface BranchDTO {
    amB_Id?: number;
    amB_BranchName?: string;
}

export interface CollegeOverallDailyAttendanceReportPayload {
    asmaY_Id?: number;
    ASMAY_Id?: number;
    amB_Id?: number;
    amcO_Id?: number;
    fromDate?: string;
    fromdate?: string;
    temp_branchDTO?: BranchDTO[];
}

function formatSelectedDate(dateVal?: string | Date): string {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
}

/**
 * Fetches attendance summary report
 */
export async function getCollegeOverallDailyAttendanceReport(data: CollegeOverallDailyAttendanceReportPayload) {
    try {
        const selectedDate = formatSelectedDate(data.fromDate ?? data.fromdate);
        const branches =
            data.temp_branchDTO && data.temp_branchDTO.length > 0
                ? data.temp_branchDTO
                : [{ amB_Id: data.amB_Id ?? 0, amB_BranchName: 'string' }];

        const payload = {
            asmaY_Id: data.asmaY_Id ?? data.ASMAY_Id ?? 0,
            ASMAY_Id: data.asmaY_Id ?? data.ASMAY_Id ?? 0,
            amB_Id: data.amB_Id ?? 0,
            AMB_Id: data.amB_Id ?? 0,
            amcO_Id: data.amcO_Id ?? 0,
            AMCO_Id: data.amcO_Id ?? 0,
            fromDate: selectedDate,
            fromdate: selectedDate,
            temp_branchDTO: branches
        };
        console.log('[Server] getCollegeOverallDailyAttendanceReport payload:', JSON.stringify(payload));
        const res = await api.post<any>('college', `${BASE_URL}/GetAttendancedetails`, payload);
        console.log('[Server] getCollegeOverallDailyAttendanceReport response:', JSON.stringify(res)?.substring(0, 500));
        return res;
    } catch (error) {
        console.error('[Server] getCollegeOverallDailyAttendanceReport error:', error);
        return { success: false, message: 'Failed to fetch attendance report', getstudentlist1: [], collegestudentAttendanceList: [] } as any;
    }
}

export interface CollegeStudentAbsentDetailsParams {
    AMB_Id: number;
    AMSE_Id: number;
    ASMAY_Id: number;
    FromDate?: string | Date;
    fromdate?: string | Date;
}

/**
 * Fetches absent students and teacher details for a specific branch and semester
 */
export async function getCollegeStudentAbsentDetails(data: CollegeStudentAbsentDetailsParams) {
    try {
        const rawDate = data.FromDate ?? data.fromdate;
        let fromDateStr = '';
        if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                fromDateStr = `${year}-${month}-${day}`;
            } else {
                fromDateStr = String(rawDate);
            }
        }

        const url = `${BASE_URL}/getStudentAbsentDetails?ASMAY_Id=${data.ASMAY_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&FromDate=${fromDateStr}`;
        console.log('[Server] getCollegeStudentAbsentDetails URL:', url);
        return await api.post<any>('college', url);
    } catch (error) {
        console.error('[Server] getCollegeStudentAbsentDetails error:', error);
        return { success: false, message: 'Failed to fetch student absent details', getstudentlist1: [], studentAbsent_teacherList: [] } as any;
    }
}
