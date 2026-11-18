'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import type {
    EmployeeDropDown,
    EmployeeLeaveResponse,
    OnlineAdminLeaveApplication,
    SaveAdminEmployeeLeaveApplicationRequest
} from '@/types/hrms/leave-management/online-admin-leave';

/**
 * Get employee drop down details
 * GET /api/MasterDropDown/get_employees_drop_down
 */
export async function getEmployeesDropDown(): Promise<ApiResponse<EmployeeDropDown[]>> {
    // Correct URL with /api prefix as per user logs and standard pattern
    const url = '/api/MasterDropDown/get_employees_drop_down';
    try {
        console.log('🔵 [SERVER] Fetching employee dropdown from hrms:', url);
        const response = await api.getArray<EmployeeDropDown>('hmslms', url);
        console.log('✅ [SERVER] Employee dropdown response:', {
            success: response.success,
            dataCount: response.data?.length
        });

        // Some APIs might return data without a success field, treat as success if data exists
        const isSuccess =
            response.success === true || String(response.success) === 'true' || (Array.isArray(response.data) && response.data.length > 0);

        return {
            success: isSuccess,
            message: response.message || 'Employee drop down details fetched successfully',
            data: response.data || []
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Employee dropdown FAILED:', error);
        throw new Error(error?.message || 'Failed to fetch employee drop down details');
    }
}

/**
 * Get leave details grid by employee id
 * GET /api/OnlineLeaveApplication/get_leave_details_grid_by_employee_id?hrme_id={hrme_id}
 */
export async function getLeaveDetailsGridByEmployeeId(hrmeId: number): Promise<ApiResponse<OnlineAdminLeaveApplication[]>> {
    const url = `/api/OnlineLeaveApplication/get_leave_details_grid_by_employee_id?hrme_id=${hrmeId}`;
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;

        let dataToSet: any[] = [];
        if (Array.isArray(res.data)) {
            dataToSet = res.data;
        } else if (res.data && Array.isArray(res.data.get_leave_details)) {
            dataToSet = res.data.get_leave_details;
        } else if (res.data && Array.isArray(res.data.$values)) {
            dataToSet = res.data.$values;
        }

        return {
            success: res.success === true || String(res.success) === 'true',
            message: res.message || 'Employee Leave details fetched successfully',
            data: dataToSet
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch employee leave details');
    }
}

/**
 * Get employee leave balance by employee id
 * GET /api/OnlineLeaveApplication/employee_leaves_by_employee_id/{hrme_id}
 */
export async function getEmployeeLeavesByEmployeeId(hrmeId: number): Promise<ApiResponse<EmployeeLeaveResponse>> {
    const url = `/api/OnlineLeaveApplication/employee_leaves_by_employee_id/${hrmeId}`;
    try {
        console.log('🔵 [SERVER] Fetching leave balance:', url);
        const response = await api.get<any>('hmslms', url);
        const res = response as any;
        console.log('✅ [SERVER] Leave balance response keys:', Object.keys(res.data || {}));
        if (res.data?.employeeLeaves) console.log('✅ [SERVER] employeeLeaves count:', res.data.employeeLeaves.length);

        return {
            success: res.success === true || String(res.success) === 'true',
            message: res.message || 'Employee leave balance fetched successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch employee leave balance');
    }
}

/**
 * Save admin employee leave application
 * POST /api/OnlineLeaveApplication/save_admin_employee_leave_application
 */
export async function saveAdminEmployeeLeaveApplication(data: SaveAdminEmployeeLeaveApplicationRequest): Promise<ApiResponse<any>> {
    const url = '/api/OnlineLeaveApplication/save_admin_employee_leave_application';
    try {
        const response = await api.post<any>('hmslms', url, data);
        const res = response as any;
        return {
            success: res.success === true || String(res.success) === 'true',
            message: res.message || 'Leave application submitted successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to submit leave application');
    }
}
