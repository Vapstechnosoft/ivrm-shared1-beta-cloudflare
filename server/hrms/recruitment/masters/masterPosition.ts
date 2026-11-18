'use server';
import { type ApiResponse, api } from '@/lib/apiService';

export async function getMasterPositionGridData(mi_id: number): Promise<ApiResponse<any>> {
    const url = `/api/MasterPosition/get_master_position_grid/${mi_id}`;
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching master position grid data:', error);
        throw error;
    }
}

export interface saveOrUpdatePositionPayload {
    hrmP_Id: number;
    mi_Id: number;
    hrmP_Position: string;
    hrmP_Skills: string;
    hrmP_Desc: string;
    hrmP_ActiveFlg: boolean;
}

export async function saveOrUpdatePosition(payload: saveOrUpdatePositionPayload): Promise<ApiResponse<any>> {
    const url = '/api/MasterPosition/save_or_update_position';
    try {
        const response = await api.post('hrmsrecruitment', url, payload);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data saved successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error saving or updating position:', error);
        throw error;
    }
}

export async function togglePositionStatusData(hrmp_Id: number): Promise<ApiResponse<any>> {
    const url = `/api/MasterPosition/toggle_position/${hrmp_Id}`;
    try {
        const response = await api.put('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Status toggled successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error toggling position status:', error);
        throw error;
    }
}
