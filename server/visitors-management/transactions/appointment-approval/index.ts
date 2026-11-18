'use server';

import { api } from '@/lib/apiService';
import type { AppointmentApprovalLoadData } from '@/types/visitors-management/appointment-approval-types';

import type { AppointmentApprovalSchema, FeedbackSchema } from '@/schemas/visitors-management/appointment-approval-schema';

const API_URL = 'V_AppointmentApprovalStatus';

// ------------------------------
// LOAD DATA
// ------------------------------
export async function getAppointmentApprovalData(id = 1) {
    try {
        const res = await api.get<AppointmentApprovalLoadData>('exam', `loaddata/${id}`);

        if (!res.success) {
            throw new Error(res.message || 'Failed to fetch appointment approval data');
        }

        return res as unknown as AppointmentApprovalLoadData & { success: boolean; message: string };
    } catch (error) {
        console.error('Error fetching appointment approval data:', error);

        return {
            success: false,
            message: 'Failed to fetch data',
            visitorlist: [],
            griddata: [],
            emplist: []
        } as unknown as AppointmentApprovalLoadData & { success: boolean; message: string };
    }
}

// ------------------------------
// SAVE APPOINTMENT APPROVAL
// ------------------------------
export async function saveAppointmentApproval(data: AppointmentApprovalSchema) {
    try {
        const payload = {
            ...data,
            VMAP_MeetingTiming: data.VMAP_MeetingTiming,
            VMAP_MeetingToTime: data.VMAP_MeetingToTime
        };

        const res = await api.post<any>('exam', `${API_URL}/saveData`, payload);

        if (!res.success) {
            throw new Error(res.message || 'Failed to save appointment approval');
        }

        return res;
    } catch (error) {
        console.error('Error saving appointment approval:', error);

        return {
            success: false,
            message: 'Failed to save data',
            returnVal: 'error'
        };
    }
}

// ------------------------------
// SAVE FEEDBACK
// ------------------------------
export async function saveFeedback(data: FeedbackSchema) {
    try {
        const res = await api.post<any>('exam', `${API_URL}/savefeedback`, data);

        if (!res.success) {
            throw new Error(res.message || 'Failed to save feedback');
        }

        return res;
    } catch (error) {
        console.error('Error saving feedback:', error);

        return {
            success: false,
            message: 'Failed to save feedback'
        };
    }
}

// ------------------------------
// GET FEEDBACK
// ------------------------------
export async function getFeedback(data: { VMAP_Id: number }) {
    try {
        const res = await api.post<any>('exam', `${API_URL}/getfeedback`, data);

        if (!res.success) {
            throw new Error(res.message || 'Failed to fetch feedback');
        }

        return res;
    } catch (error) {
        console.error('Error fetching feedback:', error);

        return {
            success: false,
            message: 'Failed to fetch feedback'
        };
    }
}

// ------------------------------
// SEND MOM
// ------------------------------
export async function sendMOM(data: any) {
    try {
        const res = await api.post<any>('exam', `${API_URL}/sendMOM`, data);

        if (!res.success) {
            throw new Error(res.message || 'Failed to send MOM');
        }

        return res;
    } catch (error) {
        console.error('Error sending MOM:', error);

        return {
            success: false,
            message: 'Failed to send MOM'
        };
    }
}
