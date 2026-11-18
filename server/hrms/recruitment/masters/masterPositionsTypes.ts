'use server';
import { type ApiResponse, api } from '@/lib/apiService';

export async function getMasterPositionTypeGridData(mi_id: number): Promise<ApiResponse<any>> {
    const url = `/api/MasterPositionType/get_position_type_grid/${mi_id}`;
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching master position type grid data:', error);
        throw error;
    }
}

export interface saveOrUpdatePositionTypePayload {
    hrmpT_Id: number;
    mi_id: number;
    hrmpT_Name: string;
    hrmpT_Desc: string;
}

export async function saveOrUpdatePositionType(payload: saveOrUpdatePositionTypePayload): Promise<ApiResponse<any>> {
    const url = '/api/MasterPositionType/save_or_update_position_type';
    try {
        const response = await api.post('hrmsrecruitment', url, payload);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data saved successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error saving or updating position type:', error);
        throw error;
    }
}

export async function togglePositionTypeStatusData(hrmpT_Id: number): Promise<ApiResponse<any>> {
    const url = `/api/MasterPositionType/toggle_position_type/${hrmpT_Id}`;
    try {
        const response = await api.put('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Status toggled successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error toggling position type status:', error);
        throw error;
    }
}
