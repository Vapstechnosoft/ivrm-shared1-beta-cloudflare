'use server';

import { api } from '@/lib/apiService';
import type { LeaveApplyPayload, LeaveLoadData, OnlineLeaveApp_DTO } from './types';

const CONTROLLER = 'OnlineLeaveApp';

export async function getLeaveLoadData(): Promise<LeaveLoadData> {
    try {
        const response = await api.get<any>('portal', `/${CONTROLLER}/get-leave-details`);

        // Debug logs
        if (response.data) {
            console.log('DEBUG: Raw API Data:', JSON.stringify(response.data).substring(0, 500));
        }

        const data = response.data;

        // Handle case sensitivity issues by checking for variations
        // Also check for alternative field names like student_s_list
        let studentdetails = data?.studentdetails || data?.studentDetails || data?.StudentDetails || [];
        if (!studentdetails || studentdetails.length === 0) {
            studentdetails = data?.student_s_list || [];
        }

        let allstuddata = data?.allstuddata || data?.allStudData || data?.Allstuddata || data?.AllStudData || [];
        if (!allstuddata || allstuddata.length === 0) {
            allstuddata = data?.student_leave_list || [];
        }

        const roletype = data?.roletype || data?.roleType || data?.RoleType || '';
        const pendingleave = data?.pendingleave || [];
        const yearlist = data?.yearlist || [];

        // Extract context IDs
        const mi_Id = data?.mI_Id || 0;
        const asmaY_Id = data?.asmaY_Id || 0;

        return {
            roletype: roletype,
            studentdetails: studentdetails,
            allstuddata: allstuddata,
            pendingleave: pendingleave,
            yearlist: yearlist,
            mi_Id: mi_Id,
            asmaY_Id: asmaY_Id
        };
    } catch (error) {
        console.error('Error fetching Leave load data:', error);
        // Return empty structure to prevent crash
        return {
            roletype: '',
            studentdetails: [],
            allstuddata: [],
            pendingleave: [],
            yearlist: []
        };
    }
}

export async function applyLeave(data: LeaveApplyPayload) {
    try {
        // Payload structure matches user request
        const payload = {
            aslA_Id: data.aslA_Id,
            mi_Id: data.mi_Id,
            amsT_Id: data.amsT_Id,
            asmaY_Id: data.asmaY_Id,
            aslA_LeaveId: data.aslA_LeaveId,
            aslA_Reason: data.aslA_Reason,
            aslA_ApplyDate: data.aslA_ApplyDate,
            aslA_FromDate: data.aslA_FromDate,
            aslA_ToDate: data.aslA_ToDate,
            aslA_Flag: data.aslA_Flag
        };

        const response = await api.post<OnlineLeaveApp_DTO>('portal', `/${CONTROLLER}/get-leave-apply-details`, payload);
        return {
            returnval: response.data?.returnval ?? false
        };
    } catch (error) {
        console.error('Error applying Leave:', error);
        return {
            returnval: false
        };
    }
}

export async function cancelLeave(leaveId: number) {
    try {
        const payload: OnlineLeaveApp_DTO = {
            aslA_Id: leaveId
        };
        const response = await api.post<OnlineLeaveApp_DTO>('portal', `/${CONTROLLER}/cancel-leave`, payload);
        return {
            returnval: response.data?.returnval ?? false
        };
    } catch (error) {
        console.error('Error cancelling Leave:', error);
        return {
            returnval: false
        };
    }
}

export async function deactiveLeave(leaveId: number) {
    try {
        const payload: OnlineLeaveApp_DTO = {
            aslA_Id: leaveId
        };
        const response = await api.post<OnlineLeaveApp_DTO>('portal', `/${CONTROLLER}/deactive-leave`, payload);
        return {
            returnval: response.data?.returnval ?? false
        };
    } catch (error) {
        console.error('Error deactivating Leave:', error);
        return {
            returnval: false
        };
    }
}
