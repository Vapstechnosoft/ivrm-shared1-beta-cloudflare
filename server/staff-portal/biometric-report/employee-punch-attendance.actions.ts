'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import type {
    IEmployeeDetails,
    IEmployeePunchAttendanceFilter,
    IEmployeePunchAttendanceReportData
} from '@/types/staff-portal/biometric-report/employee-punch-attendance.types';

const BASE_URL = '/EmployeePunchAttendence';

export const getEmployeePunchAttendanceInitialData = async (): Promise<ApiResponse<IEmployeeDetails[]>> => {
    return await api.get<IEmployeeDetails[]>('portal', `${BASE_URL}/getalldetails`);
};

export const getEmployeePunchAttendanceReport = async (
    payload: IEmployeePunchAttendanceFilter
): Promise<ApiResponse<IEmployeePunchAttendanceReportData>> => {
    const queryParams = new URLSearchParams({
        fromdate: payload.fromdate,
        todate: payload.todate
    }).toString();

    return await api.post<IEmployeePunchAttendanceReportData>('portal', `${BASE_URL}/getrpt?${queryParams}`, {});
};
