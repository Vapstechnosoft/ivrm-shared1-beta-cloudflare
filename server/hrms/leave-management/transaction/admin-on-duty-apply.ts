'use server';
import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    AdminOnDutyApplyApiData,
    EmployeeOnDutyDetailsResponse,
    OnDutyLeaveSaveRequest
} from '@/types/hrms/leave-management/admin-on-duty-apply';

/**
 * Get employee on duty leave apply list
 * GET /api/AdminOnDutyApply/get_employee_on_duty_leave_apply
 */
export async function getEmployeeOnDutyLeaveApply(searchParams?: ApiSearchparams): Promise<ApiResponse<AdminOnDutyApplyApiData[]>> {
    const baseUrl = '/api/AdminOnDutyApply/get_employee_on_duty_leave_apply';
    const queryParams = getSearchParamsUrl(searchParams);
    const url = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;

    console.log('🔵 [SERVER] AdminOnDutyApply - Requesting:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;

        // Detailed logging
        console.log('📊 [SERVER] AdminOnDutyApply - Response Metadata:', {
            hasBody: !!res,
            type: typeof res,
            isArray: Array.isArray(res),
            keys: res && typeof res === 'object' ? Object.keys(res) : []
        });

        const extractedData: AdminOnDutyApplyApiData[] = res?.data || [];
        const isSuccess = res?.success === true || String(res?.success) === 'true' || extractedData.length > 0;
        const total = res?.total || extractedData.length;

        console.log(`✅ [SERVER] AdminOnDutyApply - Final Result: ${extractedData.length} records, Total: ${total}, Success: ${isSuccess}`);

        return {
            success: isSuccess,
            message: res?.message || 'Success',
            data: extractedData,
            total: total,
            page: res?.page || 1,
            page_size: res?.page_size || 10
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] AdminOnDutyApply - ERROR:', error.message);
        throw new Error(error?.message || 'Failed to fetch leave list');
    }
}

/**
 * Get employee on duty details by ID
 * GET /api/AdminOnDutyApply/employee_on_duty_details_by_id/{hrme_id}
 */
export async function getEmployeeOnDutyDetails(hrmeId: number): Promise<ApiResponse<EmployeeOnDutyDetailsResponse>> {
    const url = `/api/AdminOnDutyApply/employee_on_duty_details_by_id/${hrmeId}`;
    console.log('🔵 [SERVER] GET Request URL:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Employee details fetched successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch employee details');
    }
}

/**
 * Save on duty leave request
 * POST /api/AdminOnDutyApply/on_duty_leave_request
 */
export async function saveOnDutyLeaveRequest(data: OnDutyLeaveSaveRequest): Promise<ApiResponse<any>> {
    const url = '/api/AdminOnDutyApply/on_duty_leave_request';
    console.log('🟠 [SERVER] POST Request URL:', url);
    try {
        const response = await api.post<any>('hmslms', url, data);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Leave application submitted successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to submit leave application');
    }
}

/**
 * Get leave details by ID
 * GET /api/AdminOnDutyApply/get_leave_details_by_id/{hrelap_id}
 */
export async function getLeaveDetailsById(hrelapId: number): Promise<ApiResponse<any>> {
    const url = `/api/AdminOnDutyApply/get_leave_details_by_id/${hrelapId}`;
    console.log('🔵 [SERVER] GET Request URL:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Leave details fetched successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch leave details');
    }
}

/**
 * Delete leave by ID
 * DELETE /api/AdminOnDutyApply/delete_leave_by_id/{hrelap_id}
 */
export async function deleteLeaveById(hrelapId: number): Promise<ApiResponse<any>> {
    const url = `/api/AdminOnDutyApply/delete_leave_by_id/${hrelapId}`;
    console.log('🔴 [SERVER] DELETE Request URL:', url);
    try {
        const response = await api.delete<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Leave deleted successfully',
            data: res.data || null
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to delete leave');
    }
}

/**
 * View on duty leave details by ID
 * GET /api/AdminOnDutyApply/view_on_duty_leave_details_by_id/{hrelap_id}
 */
export async function viewOnDutyLeaveDetailsById(hrelapId: number): Promise<ApiResponse<any>> {
    const url = `/api/AdminOnDutyApply/view_on_duty_leave_details_by_id/${hrelapId}`;
    console.log('🔵 [SERVER] GET Request URL:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true';

        return {
            success: isSuccess,
            message: res.message || 'Leave details fetched successfully',
            data: res.data || []
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch leave details');
    }
}
/**
 * Toggle on duty leave active status
 * PUT /api/AdminOnDutyApply/active_deactivate_leave_by_id/{hrelap_id}
 */
export async function toggleActiveStatusOnDuty(hrelapId: number): Promise<ApiResponse<any>> {
    const url = `/api/AdminOnDutyApply/active_deactivate_leave_by_id/${hrelapId}`;

    console.log(`🟡 [SERVER] PUT AdminOnDutyApply Toggle Target: ${url}`);

    try {
        const response = await api.put<any>('hmslms', url);
        console.log('🟡 [SERVER] Toggle Response:', JSON.stringify(response, null, 2));

        const res = response as any;
        const isSuccess = res.success === true || String(res.success) === 'true' || res.returnval === true;

        return {
            success: isSuccess,
            message: res.message || 'Status toggled successfully',
            data: res.data || null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] AdminOnDutyApply Toggle Error:', error.message);
        throw new Error(error?.message || 'Failed to toggle status');
    }
}
/**
 * Get employee dropdown for Admin On Duty Apply
 * GET /api/AdminOnDutyApply/get_employee_on_duty_leave_apply
 * Note: Many VAPS controllers return dropdowns in the initial GET call
 */
export async function getAdminOnDutyEmployeeDropdown(): Promise<ApiResponse<any[]>> {
    const url = '/api/AdminOnDutyApply/get_employee_on_duty_leave_apply';
    console.log('🔵 [SERVER] AdminOnDutyApply - Requesting Dropdown:', url);
    try {
        const response = await api.get<any>('hmslms', url);
        const res = response as any;

        const getVal = (obj: any, key: string) => {
            if (!obj || typeof obj !== 'object') return undefined;
            if (key in obj) return obj[key];
            const lowKey = key.toLowerCase();
            for (const k in obj) {
                if (k.toLowerCase() === lowKey) return obj[k];
            }
            return undefined;
        };

        // VAPS usually returns this in 'employeedropdown' or 'employeeDropdown'
        let dropdownData = getVal(res, 'employeedropdown') || getVal(res, 'employeeDropdown');

        if (!dropdownData) {
            // Fallback: If not found, check if we can get it from hrms microservice generic dropdown
            const genericUrl = '/api/TransHREmpSalaryAdvance/get_salary_advance_employee_dropdown';
            console.log('⚠️ [SERVER] AdminOnDutyApply - employeedropdown not found in hmslms. Trying generic hrms dropdown:', genericUrl);
            const genericRes = await api.get<any>('hrms', genericUrl);
            dropdownData = getVal(genericRes, 'data') || genericRes;
        }

        const isSuccess = Array.isArray(dropdownData) || !!dropdownData;

        return {
            success: isSuccess,
            message: getVal(res, 'message') || 'Success',
            data: dropdownData || []
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] AdminOnDutyApply - Dropdown ERROR:', error.message);
        // Return empty array instead of throwing to avoid breaking the form
        return {
            success: false,
            message: error?.message || 'Failed to fetch employee list',
            data: []
        };
    }
}
