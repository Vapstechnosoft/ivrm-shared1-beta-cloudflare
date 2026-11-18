'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterTimeSetting } from '@/types/hrms/attendance-management/masters';

/**
 * Get Master Time Settings grid data
 * GET /api/MasterTimeSetting/master_time_settings_grid
 */
export async function getMasterTimeSettings(searchParams?: ApiSearchparams) {
    const searchableColumns = 'fomtS_FixTimings'; // Assuming this based on common patterns
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/MasterTimeSetting/master_time_settings_grid?${urlParams}`;
    return await api.get<IMasterTimeSetting[]>('hrmsfrontoffice', url);
}

/**
 * Add or Update Master Time Settings
 * POST /api/MasterTimeSetting/add_or_update_master_time_settings
 */
export async function addOrUpdateMasterTimeSetting(data: IMasterTimeSetting) {
    const url = '/api/MasterTimeSetting/add_or_update_master_time_settings';
    return await api.post<any>('hrmsfrontoffice', url, data);
}

/**
 * Delete Master Time Setting
 * DELETE /api/MasterTimeSetting/delete_master_time_setting/{fomts_id}
 */
export async function deleteMasterTimeSetting(id: number) {
    const url = `/api/MasterTimeSetting/delete_master_time_setting/${id}`;
    return await api.delete<any>('hrmsfrontoffice', url);
}
