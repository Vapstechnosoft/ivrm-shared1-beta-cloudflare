'use client';

import {
    getCategoryWiseAttendanceInitialDetails,
    getCategoryWiseAttendanceReport
} from '@/server/admission/preadmission/reports/category_wise_attendance';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
    CATEGORY_WISE_ATTENDANCE_INITIAL: 'category_wise_attendance_initial',
    CATEGORY_WISE_ATTENDANCE_REPORT: 'category_wise_attendance_report'
};

/**
 * Hook for Categorywise Attendance Initial Details
 */
export const useCategoryWiseAttendanceInitialDetails = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.CATEGORY_WISE_ATTENDANCE_INITIAL],
        queryFn: () => getCategoryWiseAttendanceInitialDetails(),
        staleTime: Number.POSITIVE_INFINITY
    });
};

/**
 * Hook for Categorywise Attendance Report
 */
export const useCategoryWiseAttendanceReport = (
    asmaY_Id: number,
    fromdate: Date | undefined,
    categoryIds: number[],
    params?: ApiSearchparams,
    enabled = true
) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.CATEGORY_WISE_ATTENDANCE_REPORT, asmaY_Id, fromdate, categoryIds, params ?? {}],
            queryFn: async () => {
                if (!fromdate) return { data: [] } as any;
                return getCategoryWiseAttendanceReport(asmaY_Id, fromdate, categoryIds, params);
            },
            enabled: enabled && !!asmaY_Id && !!fromdate && categoryIds.length > 0,
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.CATEGORY_WISE_ATTENDANCE_REPORT]
            });
        }
    };
};
