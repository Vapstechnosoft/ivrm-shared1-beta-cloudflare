'use server';

import { type ApiResponse, api } from '@/lib/apiService';

export async function getMasterPriorityGridData(): Promise<ApiResponse<any>> {
    const url = `/api/MasterPriority/get_master_priority_grid`;
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching master priority grid data:', error);
        throw error;
    }
}

export interface saveOrUpdatePriorityPayload {
    hrmpR_Id: number;
    hrmP_Name: string;
    hrmP_Order: number;
    hrmP_ActiveFlag?: boolean;
}

export async function saveOrUpdatePriority(payload: saveOrUpdatePriorityPayload): Promise<ApiResponse<any>> {
    const url = '/api/MasterPriority/save_or_update_priority';
    try {
        const response = await api.post('hrmsrecruitment', url, payload);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data saved successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error saving or updating priority:', error);
        throw error;
    }
}

export async function togglePriorityStatusData(hrmpr_Id: number): Promise<ApiResponse<any>> {
    const url = `/api/MasterPriority/toggle_priority_status/${hrmpr_Id}`;
    try {
        const response = await api.put('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Status toggled successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error toggling priority status:', error);
        throw error;
    }
}
