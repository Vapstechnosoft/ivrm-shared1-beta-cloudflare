'use server';

import { api } from '@/lib/apiService';

export async function getEmployeesByFilter(designationId: number, deptId: number, groupTypeId: number) {
    const url = `/api/ReportEmployeeOfferAndExperience/get_employees_dropdown/${designationId}/${deptId}/${groupTypeId}`;
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
            message: response.message || 'Failed to fetch employees',
            data: []
        };
    } catch (error: any) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch employees',
            data: []
        };
    }
}

export async function getEmployeeLetterDetails(designationId: number, deptId: number, groupTypeId: number, employeeId: number) {
    const url = `/api/ReportEmployeeOfferAndExperience/emp_details_for_offer_and_exprience_letter/${groupTypeId}/${deptId}/${designationId}/hrme_id?hrme_id=${employeeId}`;
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
            message: response.message || 'Failed to fetch employee details',
            data: null
        };
    } catch (error: any) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch employee details',
            data: null
        };
    }
}

export async function getEmployeeOfferAndExperienceReport(payload: {
    HRME_Id: number;
    HRMGT_Id: number;
    HRMD_Id: number;
    HRMDES_Id: number;
}) {
    const url = '/api/EmployeeOfferAndExperienceReport/getReport';
    try {
        const response = await api.post<any>('hrms', url, payload);
        if (response.success) {
            return {
                success: true,
                data: response.data,
                message: response.message
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to fetch report data',
            data: null
        };
    } catch (error: any) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch report data',
            data: null
        };
    }
}
