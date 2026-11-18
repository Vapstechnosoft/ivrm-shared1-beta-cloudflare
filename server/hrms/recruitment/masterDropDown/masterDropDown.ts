'use server';
import { type ApiResponse, api } from '@/lib/apiService';

/**
 * Get Position type dropdown
 */

export async function getPositionTypeDropdown(): Promise<ApiResponse<any[]>> {
    const url = '/api/MasterDropDown/get_position_type_list';
    try {
        const response = await api.get<any[]>('hrmsrecruitment', url);

        const res = response as any;
        return {
            success: res?.success ?? true,
            message: res?.message || 'Data fetched successfully',
            data: res?.data || res || []
        };
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch position type dropdown');
    }
}
