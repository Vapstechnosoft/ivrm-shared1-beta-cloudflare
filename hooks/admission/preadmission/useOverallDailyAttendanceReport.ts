'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getOverallDailyAttendanceReportDetails,
    getOverallDailyAttendanceReportInitialData,
    getOverallDailyAttendanceReportStudentAllDetails,
    getOverallDailyAttendanceReportStudentDetails
} from '@/server/admission/preadmission/reports/overall_daily_attendance_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useOverallDailyAttendanceReportInitialData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'overall_daily_attendance_report', 'initial_data'],
        queryFn: () => getOverallDailyAttendanceReportInitialData(),
        staleTime: 0
    });
};

export const useOverallDailyAttendanceReportDetails = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; fromdate: string; AMC_Id: number }) => getOverallDailyAttendanceReportDetails(data)
    });
};

export const useOverallDailyAttendanceReportStudentDetails = () => {
    return useMutation({
        mutationFn: (data: { ASMCL_Id: number; ASMS_Id: number; ASMAY_Id: number; fromdate: string }) =>
            getOverallDailyAttendanceReportStudentDetails(data)
    });
};

export const useOverallDailyAttendanceReportStudentAllDetails = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; fromdate: string }) => getOverallDailyAttendanceReportStudentAllDetails(data)
    });
};
