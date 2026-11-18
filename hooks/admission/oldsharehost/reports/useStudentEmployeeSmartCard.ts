'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getStudentEmployeeSmartCardInitialDetails,
    getStudentEmployeeSmartCardReport
} from '@/server/admission/oldsharehost/reports/student_employee_smart_card';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useStudentEmployeeSmartCardInitialDetails = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'student_employee_smart_card_initial_details'],
        queryFn: getStudentEmployeeSmartCardInitialDetails
    });
};

export const useStudentEmployeeSmartCardReport = () => {
    return useMutation({
        mutationFn: (payload: any) => getStudentEmployeeSmartCardReport(payload)
    });
};
