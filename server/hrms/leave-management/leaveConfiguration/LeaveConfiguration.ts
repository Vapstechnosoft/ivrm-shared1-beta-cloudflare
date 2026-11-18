'use server';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { type ApiResponse, api } from '@/lib/apiService';
import type {
    LeaveConfigurationData,
    LeaveConfigurationGetResponse,
    LeaveConfigurationSaveRequest
} from '@/types/hrms/leave-management/leaveConfiguration/leaveConfiguration';

/**
 * Get Leave Configuration
 * Matches IVRM LeaveConfigController: GET /api/LeaveConfig/getSPName/{id}
 *
 * @returns Leave configuration data
 */
export async function getLeaveConfiguration(): Promise<ApiResponse<LeaveConfigurationData>> {
    const primaryUrl = `/api/LeaveConfig/get_leave_configuartion/${HRMS_MI_ID}`;
    console.log('🔵 [SERVER] GET Leave Configuration Request URL:', primaryUrl);

    try {
        let response: any;
        try {
            response = await api.get<LeaveConfigurationGetResponse>('hmslms', primaryUrl);
        } catch (getSpErr: any) {
            console.warn('⚠️ [SERVER] Primary endpoint get_leave_configuartion failed, trying fallback /api/LeaveConfig/get_leave_configuartion', getSpErr?.message);
            response = await api.get<LeaveConfigurationGetResponse>('hmslms', '/api/LeaveConfig/get_leave_configuartion');
        }

        console.log('🔵 [SERVER] GET Response:', JSON.stringify(response, null, 2));

        const res = response as any;
        // IVRM returns config_data array in HR_Leave_Policy_Config_DTO
        const configDataArray = res?.config_data || res?.data?.config_data || (Array.isArray(res?.data) ? res.data : null);

        if (Array.isArray(configDataArray) && configDataArray.length > 0) {
            return {
                success: true,
                message: res.message || 'Leave configuration fetched successfully',
                data: configDataArray[0]
            };
        }

        // Direct object inside data
        if (res?.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
            return {
                success: true,
                message: res.message || 'Leave configuration fetched successfully',
                data: res.data
            };
        }

        // If returned at root
        if (res?.hrlpC_LeavePolicyName || res?.HRLPC_LeavePolicyName) {
            return {
                success: true,
                message: 'Leave configuration fetched successfully',
                data: res
            };
        }

        return {
            success: true,
            message: 'No configuration found or settings not done',
            data: null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Error fetching leave configuration:', error?.message);
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || 'Failed to fetch leave configuration',
            data: null
        };
    }
}

/**
 * Save Leave Configuration
 * Matches IVRM LeaveConfigController: POST /api/LeaveConfig/SaveData
 *
 * @param data - Leave configuration data to save
 * @returns Save response
 */
export async function saveLeaveConfiguration(data: LeaveConfigurationSaveRequest): Promise<ApiResponse<any>> {
    const primaryUrl = '/api/LeaveConfig/add_or_update_leave_configuration';

    const requestBody: LeaveConfigurationSaveRequest = {
        HRLPC_Id: data.HRLPC_Id || 0,
        MI_Id: data.MI_Id || HRMS_MI_ID,
        HRLPC_LeavePolicyName: data.HRLPC_LeavePolicyName,
        HRLPC_SPName: data.HRLPC_SPName,
        HRLPC_ServiceName: data.HRLPC_ServiceName,
        HRLPC_LateInFlag: data.HRLPC_LateInFlag,
        HRLPC_LateInTime: data.HRLPC_LateInTime,
        HRLPC_EarlyOutFlag: data.HRLPC_EarlyOutFlag,
        HRLPC_EarlyOutTime: data.HRLPC_EarlyOutTime,
        HRLPC_CummulativeTimeFlag: data.HRLPC_CummulativeTimeFlag,
        HRLPC_CummulativeTime: data.HRLPC_CummulativeTime,
        HRLPC_AfterCummulativeTime: data.HRLPC_AfterCummulativeTime,
        HRLPC_NoOfLatesCFFlag: data.HRLPC_NoOfLatesCFFlag,
        HRLPC_LeavePrefixSuffixFlag: data.HRLPC_LeavePrefixSuffixFlag,
        HRLPC_IncludeHolidayFlag: data.HRLPC_IncludeHolidayFlag,
        HRLPC_LateLeaveFlag: data.HRLPC_LateLeaveFlag,
        HRLPC_LateLOPFlag: data.HRLPC_LateLOPFlag,
        HRLPC_NoOfLatesFag: data.HRLPC_NoOfLatesFag,
        HRLPC_NoOfLates: Number(data.HRLPC_NoOfLates) || 0,
        HRLPC_SpOrGen: data.HRLPC_SpOrGen,
        HRLPC_AbsentLOPFlag: data.HRLPC_AbsentLOPFlag,
        HRLPC_AbsentLeaveFlag: data.HRLPC_AbsentLeaveFlag
    };

    console.log('🟠 [SERVER] POST Save Leave Configuration URL:', primaryUrl);
    console.log('🟠 [SERVER] Request Body:', JSON.stringify(requestBody, null, 2));

    try {
        let response: any;
        try {
            response = await api.post<any>('hmslms', primaryUrl, requestBody);
        } catch (saveErr: any) {
            console.warn('⚠️ [SERVER] Primary SaveData failed, trying fallback /api/LeaveConfig/add_or_update_leave_configuration', saveErr?.message);
            response = await api.post<any>('hmslms', '/api/LeaveConfig/add_or_update_leave_configuration', requestBody);
        }

        console.log('🟢 [SERVER] Response:', JSON.stringify(response, null, 2));

        const res = response as any;
        const isSuccess =
            res.returnval === true ||
            String(res.returnval) === 'true' ||
            res.success === true ||
            String(res.success) === 'true';

        if (isSuccess || res.returnval !== false) {
            return {
                success: true,
                message: res.message || 'Record Saved/Updated Successfully',
                data: res.data || res
            };
        }

        return {
            success: false,
            message: res.message || 'Failed to Save/Update. Check The Entries.',
            data: null
        };
    } catch (error: any) {
        console.error('🔴 [SERVER] Save Error:', error);
        return {
            success: false,
            message: error?.response?.data?.message || error?.message || 'Failed to save leave configuration',
            data: null
        };
    }
}
