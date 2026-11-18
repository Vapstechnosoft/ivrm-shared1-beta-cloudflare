'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterShiftSettingList } from '@/types/hrms/attendance-management/masters';

/**
 * Get Shift Setting Master list with search, sort, and pagination
 * GET /api/ShiftSettingMasterFacade/getdata
 */
export async function getShiftSettingMaster(searchParams?: ApiSearchparams) {
    const searchableColumns = 'foms_ShiftName';
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/ShiftSettingMaster/master_shift_settings_grid?${urlParams}`;
    return await api.get<IMasterShiftSettingList[]>('hrmsfrontoffice', url);
}

export async function addOrUpdateShiftSettingMaster(data: any) {
    const url = '/api/ShiftSettingMaster/add_or_update_master_shift_timings';
    return await api.post<any>('hrmsfrontoffice', url, data);
}

/**
 * Toggle Shift Setting Master record (activate/deactivate)
 * PUT /api/ShiftSettingMaster/toggle_master_shift/{fomst_id}
 */
export async function toggleShiftSettingMaster(fomst_id: number) {
    const url = `/api/ShiftSettingMaster/toggle_master_shift/${fomst_id}`;
    return await api.put<IMasterShiftSettingList>('hrmsfrontoffice', url);
}

// DELETE
export async function deleteShiftSettingMaster(id: number) {
    const url = `/api/ShiftSettingMasterFacade/delete/${id}`;
    return await api.delete<any>('hrmsfrontoffice', url);
}
