import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import { getEmployeeInOutReport } from '@/server/hrms/hrmsConfig/reports/employee-inout-report';
import { getEmployeeLateInEarlyOutReport } from '@/server/hrms/hrmsConfig/reports/employee-latein-earlyout-report';
import { getEmployeeLogReport } from '@/server/hrms/hrmsConfig/reports/employee-log-report';
import { getEmployeeMonthEndReport } from '@/server/hrms/hrmsConfig/reports/employee-month-report';
import { getEmployeeMonthlyReport, getEmployeeMonthlyReportOnload } from '@/server/hrms/hrmsConfig/reports/employee-monthly-report';
import { getEmployeeYearlyReport } from '@/server/hrms/hrmsConfig/reports/employee-yearly-report';
import { getFOMonthEndReport } from '@/server/hrms/hrmsConfig/reports/fo-monthend-report';
import { getGPSLocationReport } from '@/server/hrms/hrmsConfig/reports/gps-location-report';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// EMPLOYEE LOG REPORT
// ============================================================================
export function useEmployeeLogReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT, searchParams ?? {}],
            queryFn: async () => getEmployeeLogReport({}),
            staleTime: 0,
            enabled: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LOG_REPORT]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE IN-OUT REPORT
// ============================================================================
export function useEmployeeInOutReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT, searchParams ?? {}],
            queryFn: async () => {
                const payload = {
                    from_date: searchParams?.fromDate ? String(searchParams.fromDate).split('T')[0] : '',
                    to_date: searchParams?.toDate ? String(searchParams.toDate).split('T')[0] : '',
                    hrme_ids: searchParams?.employee ? String(searchParams.employee).split(',').map(Number) : []
                };
                return getEmployeeInOutReport(payload);
            },
            staleTime: 0,
            enabled: !!searchParams?.fromDate && !!searchParams?.toDate
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_INOUT_REPORT]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE ABSENT REPORT
// ============================================================================
export function useEmployeeAbsentReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ABSENT_REPORT, searchParams ?? {}],
            queryFn: async () => {
                const payload = {
                    from_date: searchParams?.fromDate ? String(searchParams.fromDate).split('T')[0] : '',
                    to_date: searchParams?.toDate ? String(searchParams.toDate).split('T')[0] : '',
                    hrme_ids: (searchParams?.employee as string) || '0',
                    type: 'absent'
                };
                // Debug log for request payload
                return getEmployeeMonthlyReport(payload, searchParams);
            },
            staleTime: 0,
            enabled: !!searchParams?.fromDate && !!searchParams?.toDate
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_ABSENT_REPORT]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE LATE IN EARLY OUT REPORT
// ============================================================================
export function useEmployeeLateInEarlyOutReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT, {}],
            queryFn: async () => getEmployeeLateInEarlyOutReport({}, searchParams || {}),
            staleTime: 0,
            enabled: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_LATEIN_EARLYOUT_REPORT]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE MONTHLY REPORT
// ============================================================================
export function useEmployeeMonthlyReportOnload() {
    return useQuery({
        queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MONTHLY_REPORT, 'onload'],
        queryFn: () => getEmployeeMonthlyReportOnload()
    });
}

export function useEmployeeMonthlyReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MONTHLY_REPORT, searchParams ?? {}],
            queryFn: async () => {
                const payload = {
                    from_date: searchParams?.fromDate ? String(searchParams.fromDate).split('T')[0] : '',
                    to_date: searchParams?.toDate ? String(searchParams.toDate).split('T')[0] : '',
                    hrme_ids: (searchParams?.employee as string) || '0',
                    type: 'monthly'
                };
                return getEmployeeMonthlyReport(payload, { ...searchParams });
            },
            staleTime: 5 * 60 * 1000,
            enabled: !!searchParams?.fromDate && !!searchParams?.toDate
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MONTHLY_REPORT]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE YEARLY REPORT
// ============================================================================
export function useEmployeeYearlyReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT,
                {
                    fromDate: searchParams?.fromDate,
                    toDate: searchParams?.toDate,
                    employee: searchParams?.employee
                }
            ],
            queryFn: async () => {
                const payload = {
                    fromdate: searchParams?.fromDate ? String(searchParams.fromDate).split('T')[0] : '',
                    todate: searchParams?.toDate ? String(searchParams.toDate).split('T')[0] : '',
                    multiplehrmeid: (searchParams?.employee as string) || '0',
                    type: 'yearly'
                };
                return getEmployeeYearlyReport(payload, searchParams);
            },
            staleTime: 0,
            enabled: !!searchParams?.fromDate && !!searchParams?.toDate
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_YEARLY_REPORT]
            });
        }
    };
}

// ============================================================================
// EMPLOYEE MONTH-END REPORT
// ============================================================================
export function useEmployeeMonthEndReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MONTH_REPORT, searchParams ?? {}],
            queryFn: async () => getEmployeeMonthEndReport({}),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.EMPLOYEE_MONTH_REPORT]
            });
        }
    };
}

// ============================================================================
// FO MONTH END REPORT
// ============================================================================
export function useFOMonthEndReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.FO_MONTHEND_REPORT, searchParams ?? {}],
            queryFn: async () => getFOMonthEndReport({}, searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.FO_MONTHEND_REPORT]
            });
        }
    };
}

// ============================================================================
// GPS LOCATION REPORT
// ============================================================================
export function useGPSLocationReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.GPS_LOCATION_REPORT, searchParams ?? {}],
            queryFn: async () => getGPSLocationReport({}, searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.GPS_LOCATION_REPORT]
            });
        }
    };
}

// ============================================================================
// HOLIDAY REPORT
// ============================================================================
export function useHolidayReport(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HRMS_QUERY_KEYS.HOLIDAY_REPORT, searchParams ?? {}],
            queryFn: async () => null,
            staleTime: 0,
            enabled: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HRMS_QUERY_KEYS.HOLIDAY_REPORT]
            });
        }
    };
}
