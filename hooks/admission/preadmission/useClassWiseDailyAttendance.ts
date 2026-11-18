'use client';

import {
    getClassWiseDailyAttendanceClasses,
    getClassWiseDailyAttendanceInitialDetails,
    getClassWiseDailyAttendanceReport,
    getClassWiseDailyAttendanceSections,
    sendClassWiseDailyAttendanceSMS
} from '@/server/admission/preadmission/reports/class_wise_daily_attendance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
    CLASS_WISE_DAILY_ATTENDANCE_INITIAL: 'class_wise_daily_attendance_initial',
    CLASS_WISE_DAILY_ATTENDANCE_CLASSES: 'class_wise_daily_attendance_classes',
    CLASS_WISE_DAILY_ATTENDANCE_SECTIONS: 'class_wise_daily_attendance_sections',
    CLASS_WISE_DAILY_ATTENDANCE_REPORT: 'class_wise_daily_attendance_report'
};

/**
 * Hook for ClassWise Daily Attendance Initial Details
 */
export const useClassWiseDailyAttendanceInitialDetails = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.CLASS_WISE_DAILY_ATTENDANCE_INITIAL],
        queryFn: () => getClassWiseDailyAttendanceInitialDetails(),
        staleTime: Number.POSITIVE_INFINITY
    });
};

/**
 * Hook for fetching classes based on Academic Year
 */
export const useClassWiseDailyAttendanceClasses = (asmaY_Id: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CLASS_WISE_DAILY_ATTENDANCE_CLASSES, asmaY_Id],
        queryFn: () => getClassWiseDailyAttendanceClasses(asmaY_Id),
        enabled: !!asmaY_Id,
        staleTime: Number.POSITIVE_INFINITY
    });
};

/**
 * Hook for fetching sections based on Academic Year and Class
 */
export const useClassWiseDailyAttendanceSections = (asmaY_Id: number, asmcL_Id: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.CLASS_WISE_DAILY_ATTENDANCE_SECTIONS, asmaY_Id, asmcL_Id],
        queryFn: () => getClassWiseDailyAttendanceSections(asmaY_Id, asmcL_Id),
        enabled: !!asmaY_Id && !!asmcL_Id,
        staleTime: Number.POSITIVE_INFINITY
    });
};

/**
 * Hook for ClassWise Daily Attendance Report
 */
export const useClassWiseDailyAttendanceReport = (
    asmaY_Id: number,
    fromDate: Date | undefined,
    asmcL_Id: number,
    asmS_Id: number,
    enabled = true
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.CLASS_WISE_DAILY_ATTENDANCE_REPORT, asmaY_Id, fromDate, asmcL_Id, asmS_Id],
            queryFn: async () => {
                if (!fromDate) return { data: [] } as any;
                return getClassWiseDailyAttendanceReport(asmaY_Id, fromDate, asmcL_Id, asmS_Id);
            },
            enabled: enabled && !!asmaY_Id && !!fromDate && !!asmcL_Id && !!asmS_Id,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.CLASS_WISE_DAILY_ATTENDANCE_REPORT]
            });
        }
    };
};

/**
 * Hook for sending SMS
 */
export const useSendClassWiseDailyAttendanceSMS = () => {
    return useMutation({
        mutationFn: ({
            asmaY_Id,
            fromDate,
            asmcL_Id,
            absentList
        }: { asmaY_Id: number; fromDate: Date; asmcL_Id: number; absentList: any[] }) =>
            sendClassWiseDailyAttendanceSMS(asmaY_Id, fromDate, asmcL_Id, absentList)
    });
};
