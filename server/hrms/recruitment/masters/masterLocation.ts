'use server';
import { type ApiResponse, api } from '@/lib/apiService';

export interface saveOrUpdateLocationPayload {
    hrmlO_Id: number;
    mi_Id: number;
    hrmlO_LocationName: string;
    hrmlO_LocationDesc: string;
    hrmlO_ActiveFlg: boolean;
}

export async function getMasterLocation(): Promise<ApiResponse<any>> {
    const url = '/api/MasterLocation/get_master_locations_grid';
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching master job grid data:', error);
        throw error;
    }
}

export async function getMasterLocationGridData(mi_id: number): Promise<ApiResponse<any>> {
    const url = `/api/MasterLocation/get_master_locations_grid/${mi_id}`;
    try {
        const response = await api.get('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data fetched successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error fetching master job grid data:', error);
        throw error;
    }
}

export async function saveOrUpdateLocation(payload: saveOrUpdateLocationPayload): Promise<ApiResponse<any>> {
    const url = '/api/MasterLocation/save_or_update_location';
    try {
        const response = await api.post('hrmsrecruitment', url, payload);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data saved successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error saving master location data:', error);
        throw error;
    }
}

export async function toggleLocationStatusData(hrmlO_Id: number): Promise<ApiResponse<any>> {
    const url = `/api/MasterLocation/toggle_location_status/${hrmlO_Id}`;
    try {
        const response = await api.put('hrmsrecruitment', url);
        return {
            success: response?.success ?? true,
            message: response?.message || 'Data saved successfully',
            data: response?.data || response
        };
    } catch (error) {
        console.error('Error saving master location data:', error);
        throw error;
    }
}
