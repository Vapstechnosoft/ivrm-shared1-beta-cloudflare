'use server';
import { type ApiResponse, api } from '@/lib/apiService';

export async function getLateLeaveReport(page = 1, pageSize = 10): Promise<ApiResponse<any>> {
    const url = `/api/LeaveTransfer/get_manual_leave_deduct_grid?page=${page}&page_size=${pageSize}`;

    try {
        const response = await api.get<any>('hmslms', url);
        console.log('📊 [SERVER] Response:', JSON.stringify(response, null, 2));

        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            return response as ApiResponse<any>;
        }

        const responseData = response as any;
        return {
            success: responseData?.success,
            message: responseData?.message,
            data: responseData?.data
        };
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || error?.message || 'Failed to fetch late leave report');
    }
}

export interface LateLeaveEmployeeDeduction {
    HRME_Id: number;
    HRELS_CreditedLeaves: number;
    LeaveDeductionReason: string;
}

export interface SubmitLateLeaveRequest {
    MI_Id?: number;
    HRME_SubstituteFlag?: string;
    HRELAP_Id?: number;
    HRML_Id: number;
    HRMLY_Id: number;
    monthid: number;
    emplist: LateLeaveEmployeeDeduction[];
}

export async function submitLateLeave(data: SubmitLateLeaveRequest) {
    const url = '/api/LeaveTransfer/update_leave_status_tab';

    try {
        const response = await api.post<any>('hmslms', url, data);
        if (response.success) {
            return {
                success: true,
                message: response.message,
                data: response.data
            };
        }
        return {
            success: false,
            message: response.message
        };
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || error?.message || 'Failed to submit late leave deduction');
    }
}
