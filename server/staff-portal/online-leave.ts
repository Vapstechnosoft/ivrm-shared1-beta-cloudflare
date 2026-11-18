'use server';

import { HRMS_MI_ID } from '@/constants/hrms-config';
import { api } from '@/lib/apiService';
import type { ILeaveApplicationRequest, IOnlineLeaveHistoryResponse, IOnlineLeaveInitialResponse } from '@/types/staff-portal/online-leave';

const BASE_URL = 'OnlineLeaveApplication';

/**
 * Get initial leave data including employee profile and leave balances
 * GET /api/OnlineLeaveApplication/get_employee_leave_details
 */
export async function getInitialLeaveData() {
    try {
        console.log('🔵 [SERVER] getInitialLeaveData');
        const url = `/api/OnlineLeaveApplication/get_employee_leave_details?MI_Id=${HRMS_MI_ID}`;

        console.log(`🌐 [SERVER] Calling: GET ${url} on hmslms`);
        const response = await api.get<IOnlineLeaveInitialResponse>('hmslms', url);

        console.log('✅ [SERVER] Response Success:', response?.success);

        // biome-ignore lint/complexity/useOptionalChain: <explanation>
        if (response && response.success) {
            return response.data;
        }

        const rawRes = response as any;
        return rawRes?.data || rawRes;
    } catch (error: any) {
        console.error('🔴 [SERVER] Error in getInitialLeaveData:', error?.message || error);
        return null;
    }
}

/**
 * Get leave application history and status
 * GET /api/OnlineLeaveApplication/get_employee_leave_status_details
 */
export async function getLeaveHistory() {
    try {
        console.log('🔵 [SERVER] getLeaveHistory');
        const url = `/api/OnlineLeaveApplication/get_employee_leave_status_details?MI_Id=${HRMS_MI_ID}`;

        console.log(`🌐 [SERVER] Calling: GET ${url} on hmslms`);
        const response = await api.get<IOnlineLeaveHistoryResponse>('hmslms', url);

        // biome-ignore lint/complexity/useOptionalChain: <explanation>
        if (response && response.success) {
            return response.data;
        }

        const rawRes = response as any;
        return rawRes?.data || rawRes;
    } catch (error: any) {
        console.error('🔴 [SERVER] Error in getLeaveHistory:', error?.message || error);
        return null;
    }
}

/**
 * Apply for leave
 * POST /api/OnlineLeaveApplication/save_online_leave_application
 */
export async function applyLeave(payload: ILeaveApplicationRequest) {
    try {
        // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
        const url = `/api/OnlineLeaveApplication/save_online_leave_application`;
        console.log('🟠 [SERVER] Submitting leave application');
        const response = await api.post<any>('hmslms', url, payload);

        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true' || res.returnval === true;

        return {
            success: isSuccess,
            message: res.message || (isSuccess ? 'Leave Applied Successfully.' : 'Failed to apply leave'),
            data: res.data || null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error in applyLeave:', error?.message || error);
        return { success: false, message: error.message || 'Failed to apply leave' };
    }
}

/**
 * Delete applied leave record
 * DELETE /api/OnlineLeaveApplication/delete_employee_leave_by_id/{hrelap_id}
 */
export async function cancelLeave(hrelapId: number) {
    try {
        console.log(`🔴 [SERVER] Deleting leave record: ${hrelapId}`);
        const url = `/api/OnlineLeaveApplication/delete_employee_leave_by_id/${hrelapId}`;
        const response = await api.delete<any>('hmslms', url);

        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || (isSuccess ? 'Leave record deleted successfully.' : 'Failed to delete leave'),
            data: res.data || null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error in cancelLeave:', error?.message || error);
        return { success: false, message: error.message || 'Failed to delete leave' };
    }
}
