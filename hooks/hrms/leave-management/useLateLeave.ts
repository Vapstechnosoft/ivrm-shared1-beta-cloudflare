'use client';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getLateLeaveReport, submitLateLeave } from '@/server/hrms/leave-management/reports/lateLeave-report';
import type { SubmitLateLeaveRequest } from '@/server/hrms/leave-management/reports/lateLeave-report';
import { useMutation, useQueries } from '@tanstack/react-query';

export function useLateLeaveReport(page = 1, pageSize = 10) {
    return useQueries({
        queries: [
            {
                queryKey: [HRMS_QUERY_KEYS.LATE_LEAVE_REPORT, page, pageSize],
                queryFn: () => getLateLeaveReport(page, pageSize),
                staleTime: 0
            }
        ]
    });
}

export function useSubmitLateLeave() {
    return useMutation({
        mutationFn: (data: SubmitLateLeaveRequest) => submitLateLeave(data),
        onError: (error: any) => {
            return error;
        }
        // onSuccess:(data: any) => {
        //     return data;
        // }
    });
}
