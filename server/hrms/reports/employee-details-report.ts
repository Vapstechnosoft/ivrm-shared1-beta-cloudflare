'use server';

import { api } from '@/lib/apiService';

export interface EmployeeDetailsReportRequest {
    mI_Id: number;
    roleId: number;
    formatType: string;
    dobjl: string;
    allOrIndividual: string;
    fromDate: string;
    toDate: string;
    hrmeT_Id: number;
    hrmE_Id: number;
    typeOrEmployee: string;
    coloumns: string;
    working: boolean;
    left: boolean;
    headerselected: string[]; // Changed to string array
    groupTypeselected: number[];
    departmentselected: number[];
    designationselected: number[];
    empIds: string;
    hrmD_IdList: number[];
    hrmD_Id: number;
}

export async function getEmployeeDetailsReportOnload() {
    const url = '/api/EmployeeDetailsReport/getalldetails/2';
    try {
        const response = await api.get<any>('hrms', url);
        if (response.success) {
            return {
                success: true,
                data: response.data,
                message: response.message
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch onload data',
            data: null
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to fetch onload data',
            data: null
        };
    }
}

export async function filterEmployeeDetailsReport(data: any) {
    const url = '/api/EmployeeDetailsReport/FilterEmployeeData';
    try {
        const response = await api.post<any>('hrms', url, data);
        if (response.success) {
            return {
                success: true,
                data: response.data,
                message: response.message
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to filter data',
            data: null
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to filter data',
            data: null
        };
    }
}

export async function searchEmployeeDetailsReport(data: EmployeeDetailsReportRequest) {
    const url = '/api/ReportEmployeeDetailsReport/get_employee_details_by_selection';
    try {
        const response = await api.post<any>('hrms', url, data);
        if (response.success) {
            return {
                success: true,
                data: response.data,
                message: response.message
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch report',
            data: null
        };
    } catch (error: any) {
        console.error('SEARCH API ERROR:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch report',
            data: null
        };
    }
}

export async function getEmployeeAndEmployeeType(data: any) {
    const url = '/api/ReportEmployeeDetailsReport/get_employee_and_employee_type';
    try {
        const response = await api.post<any>('hrms', url, data);
        if (response.success) {
            return {
                success: true,
                data: response.data,
                message: response.message
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch employee details',
            data: null
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to fetch employee details',
            data: null
        };
    }
}

export async function getLoginBasedDepartmentsByGroupType(data: number[]) {
    const url = '/api/ReportEmployeeDetailsReport/GetLoginBasedDepartmentsByGroupType';
    try {
        const response = await api.post<any>('hrms', url, data);
        if (response.success) {
            return {
                success: true,
                data: response.data,
                message: response.message
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch departments',
            data: null
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to fetch departments',
            data: null
        };
    }
}
