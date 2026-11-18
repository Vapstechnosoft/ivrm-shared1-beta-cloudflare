'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import { format } from 'date-fns';

/**
 * Get initial details for Classwise Daily Attendance Report
 */
export const getClassWiseDailyAttendanceInitialDetails = async (): Promise<ApiResponse<any>> => {
    return api.get('admission', '/ClassWiseDailyAttendance/Getdetails');
};

/**
 * Get classes for a specific academic year
 */
export const getClassWiseDailyAttendanceClasses = async (asmaY_Id: number): Promise<ApiResponse<any>> => {
    return api.get('admission', `/ClassWiseDailyAttendance/setfromdate?ASMAY_Id=${asmaY_Id}`);
};

/**
 * Get sections for a specific class and year
 */
export const getClassWiseDailyAttendanceSections = async (asmaY_Id: number, asmcL_Id: number): Promise<ApiResponse<any>> => {
    return api.get('admission', `/ClassWiseDailyAttendance/getsection?ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}`);
};

/**
 * Get report data for Classwise Daily Attendance Report
 */
export const getClassWiseDailyAttendanceReport = async (
    asmaY_Id: number,
    fromDate: Date,
    asmcL_Id: number,
    asmS_Id: number,
    searchParams?: ApiSearchparams
): Promise<ApiResponse<any>> => {
    const fromDateStr = format(fromDate, 'yyyy-MM-dd');
    const url = `/ClassWiseDailyAttendance/Getdetailsreport?FromDate=${fromDateStr}&ASMS_Id=${asmS_Id}&ASMAY_Id=${asmaY_Id}&ASMCL_Id=${asmcL_Id}`;

    return api.post('admission', url, {});
};

/**
 * Send SMS to absent students
 */
export const sendClassWiseDailyAttendanceSMS = async (
    asmaY_Id: number,
    fromDate: Date,
    asmcL_Id: number,
    absentList: any[]
): Promise<ApiResponse<any>> => {
    const fromDateStr = fromDate.toISOString();
    const payload = {
        fromDate: fromDateStr,
        absentlist: absentList.map((item: any) => ({
            fromDate: fromDateStr,
            amsT_Id: item.amsT_Id || item.amst_id || item.AMST_Id,
            asmcL_Id: item.asmcL_Id || item.asmcl_id || item.ASMCL_Id || asmcL_Id,
            amsT_FirstName: item.studentname || item.amsT_FirstName || item.amst_firstname || item.AMST_FirstName,
            amsT_MobileNo: item.amsT_MobileNo || item.amst_mobileNo || item.AMST_MobileNo || item.amst_mobileno
        }))
    };

    return api.post('admission', '/ClassWiseDailyAttendance/absentsendsms', payload);
};
