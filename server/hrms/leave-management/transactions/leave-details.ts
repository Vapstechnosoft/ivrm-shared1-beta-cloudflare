'use server';

import { HRMS_MI_ID } from '@/constants/hrms-config';
import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

/**
 * Get leave credit grid data
 * GET /api/LeaveCredit/get_onload_grid_leave_credit
 */
export async function getOnloadGridLeaveCredit(params?: ApiSearchparams): Promise<ApiResponse<any>> {
    const query = getSearchParamsUrl(params);
    const url = `/api/LeaveCredit/get_onload_grid_leave_credit${query ? `?${query}` : ''}`;

    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;

        // Determine success
        const isSuccess = res.success === true || String(res.success) === 'true' || Array.isArray(res) || !!res.data;

        // Extract grid items robustly
        let gridArray: any[] = [];
        if (Array.isArray(res)) {
            gridArray = res;
        } else if (res.data) {
            if (Array.isArray(res.data)) {
                gridArray = res.data;
            } else if (typeof res.data === 'object') {
                // Check common VAPS keys for grid data
                gridArray =
                    res.data.leave_list ||
                    res.data.leave_list_dto ||
                    res.data.GridviewDetails ||
                    res.data.gridData ||
                    res.data.griddata ||
                    res.data.employeelists ||
                    [];
            }
        } else {
            // Check direct properties if not in 'data'
            gridArray = res.leave_list || res.GridviewDetails || res.griddata || [];
        }

        return {
            success: isSuccess,
            message: res.message || 'Leave credit details fetched successfully',
            data: gridArray, // This is what GenericDataTable uses
            total: res.total || res.totalItems || gridArray.length,
            page: res.page || params?.page || 1,
            page_size: res.page_size || params?.page_size || 10,
            // Keep the whole response in a separate property if components need other fields (like staff_types)
            rawResponse: res
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch leave credit list');
    }
}

/**
 * Add or update leave credit data
 * POST /api/LeaveCredit/add_leave_credit
 */
export async function addLeaveCredit(payload: any): Promise<ApiResponse<any>> {
    const url = '/api/LeaveCredit/add_leave_credit';
    try {
        const response = await api.post<any>('hmslms', url, {
            ...payload,
            mI_Id: payload.mI_Id || HRMS_MI_ID
        });
        return response;
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to save leave credit');
    }
}
