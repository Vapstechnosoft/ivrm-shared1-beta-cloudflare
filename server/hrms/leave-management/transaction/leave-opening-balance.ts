'use server';
import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type {
    LeaveOpeningBalanceEntry,
    LeaveOpeningBalanceSearch,
    SaveLeaveOpeningBalancePayload
} from '@/types/hrms/leave-management/transaction/leave-opening-balance';

/**
 * Get employee leave opening balance grid
 * GET /api/LeaveOpeningBalance/get_employee_leave_opening_balance_grid
 */
export async function getEmployeeLeaveOpeningBalanceGrid(
    searchParams?: LeaveOpeningBalanceSearch
): Promise<ApiResponse<LeaveOpeningBalanceEntry[]>> {
    const baseUrl = '/api/LeaveOpeningBalance/get_employee_leave_opening_balance_grid';
    const queryParams = getSearchParamsUrl(searchParams);
    const url = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;

    console.log('🔵 [SERVER] LeaveOpeningBalance - Requesting:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;

        // Standardize response
        const isSuccess = res.success === true || String(res.success) === 'true';
        let data: LeaveOpeningBalanceEntry[] = [];

        if (Array.isArray(res)) {
            data = res;
        } else if (res.data && Array.isArray(res.data)) {
            data = res.data;
        }

        return {
            success: isSuccess,
            message: res.message || 'Employee Leave Opening Balance fetched successfully.',
            data: data,
            total: res.total || data.length,
            page: res.page || 1,
            page_size: res.page_size || 10
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] LeaveOpeningBalance - ERROR:', error.message);
        throw new Error(error?.message || 'Failed to fetch leave opening balance');
    }
}

/**
 * Add or update employee leave opening balance
 * POST /api/LeaveOpeningBalance/add_or_update_emp_leave_opening_balance
 */
export async function addOrUpdateEmpLeaveOpeningBalance(payload: SaveLeaveOpeningBalancePayload): Promise<ApiResponse<any>> {
    const url = '/api/LeaveOpeningBalance/add_or_update_emp_leave_opening_balance';
    console.log('🟠 [SERVER] LeaveOpeningBalance - Saving:', url, payload);
    try {
        const response = await api.post<any>('hmslms', url, payload);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Employee Leave Opening Balance saved successfully.',
            data: res.data || null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] LeaveOpeningBalance - Save ERROR:', error.message);
        throw new Error(error?.message || 'Failed to save leave opening balance');
    }
}

/**
 * Delete employee leave opening balance
 * DELETE /api/LeaveOpeningBalance/delete_emp_leave_opening_balance/{hreobl_id}
 */
export async function deleteEmpLeaveOpeningBalance(hreobl_id: number): Promise<ApiResponse<any>> {
    const url = `/api/LeaveOpeningBalance/delete_emp_leave_opening_balance/${hreobl_id}`;
    console.log('🔴 [SERVER] LeaveOpeningBalance - Deleting:', url);
    try {
        const response = await api.delete<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Employee Leave Opening Balance deleted successfully.',
            data: res.data || null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] LeaveOpeningBalance - Delete ERROR:', error.message);
        throw new Error(error?.message || 'Failed to delete leave opening balance');
    }
}
