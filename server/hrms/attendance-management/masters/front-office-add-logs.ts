'use server';

import { api } from '@/lib/apiService';
import type { IEmployeePunchSaveRequest } from '@/types/hrms/attendance-management/masters';

/**
 * Save employee punch logs
 * API: /api/Employee_Add_logs_Manual/save_employee_punch
 */
export async function saveEmployeePunch(data: IEmployeePunchSaveRequest) {
    try {
        const response = await api.post<any>('hrmsfrontoffice', '/api/Employee_Add_logs_Manual/save_employee_punch', data);
        if (response.success) {
            return {
                success: true,
                data: response.data,
                message: 'Punch logs saved successfully'
            };
        }
        return {
            success: false,
            message: response.message || 'Failed to save punch logs'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to save punch logs'
        };
    }
}

/**
 * Get employee punch details
 * API: /api/Employee_Add_logs_Manual/get_employee_punch_details
 */
export async function getEmployeePunchDetails(foep_punchDate: string, hrme_id: number) {
    try {
        const response = await api.get<any>(
            'hrmsfrontoffice',
            `/api/Employee_Add_logs_Manual/get_employee_punch_details?foep_punchDate=${foep_punchDate}&hrme_id=${hrme_id}`
        );
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to fetch punch details'
        };
    }
}

/**
 * Toggle (delete) employee punch detail
 * API: /api/Employee_Add_logs_Manual/toggle_employee_punch_details/{foepd_id}
 */
export async function togglePunchDetail(foepd_id: number) {
    try {
        const response = await api.put<any>('hrmsfrontoffice', `/api/Employee_Add_logs_Manual/toggle_employee_punch_details/${foepd_id}`);
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to delete punch detail'
        };
    }
}
