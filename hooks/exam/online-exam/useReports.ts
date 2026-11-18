import { ONLINE_EXAM_QUERY_KEYS } from '@/constants/query-keys';
import { getOnlineExamReportInitialData } from '@/server/exam/online-exam/reports/online-exam-report';
import { getStaffWiseReportInitialData } from '@/server/exam/online-exam/reports/staff-wise-report';
import { useQuery } from '@tanstack/react-query';

// Hook for Online Exam Report Initial Data
export const useOnlineExamReportInitialData = () => {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.ONLINE_EXAM_REPORT],
        queryFn: getOnlineExamReportInitialData
    });
};

// Hook for Staff-Wise / Not-Submitted Report Initial Data
export const useStaffWiseReportInitialData = () => {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.STAFF_WISE_REPORT],
        queryFn: getStaffWiseReportInitialData
    });
};

