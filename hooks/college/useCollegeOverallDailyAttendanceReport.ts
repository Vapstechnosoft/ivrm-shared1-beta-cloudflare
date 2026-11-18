import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    type CollegeOverallDailyAttendanceReportPayload,
    type CollegeStudentAbsentDetailsParams,
    getCollegeOverallDailyAttendanceInitialData,
    getCollegeOverallDailyAttendanceReport,
    getCollegeStudentAbsentDetails
} from '@/server/college/CollegeAdmission/Reports/college-overall-daily-attendance-report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useCollegeOverallDailyAttendanceInitialData = () => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_OVERALL_DAILY_ATTENDANCE_REPORT, 'initial_data'],
        queryFn: async () => await getCollegeOverallDailyAttendanceInitialData(),
        staleTime: 5 * 60 * 1000
    });
};

export const useCollegeOverallDailyAttendanceReport = () => {
    return useMutation({
        mutationFn: async (data: CollegeOverallDailyAttendanceReportPayload) => await getCollegeOverallDailyAttendanceReport(data)
    });
};

export const useCollegeStudentAbsentDetails = () => {
    return useMutation({
        mutationFn: async (data: CollegeStudentAbsentDetailsParams) => await getCollegeStudentAbsentDetails(data)
    });
};
