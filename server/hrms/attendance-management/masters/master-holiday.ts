'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterHolidayList } from '@/types/hrms/attendance-management/masters';

/**
 * Get Master Holiday list with search, sort, and pagination
 * GET /api/MasterHoliday/get_master_holiday_grid
 */
export async function getMasterHoliday(searchParams?: ApiSearchparams) {
    const searchableColumns = 'fomhwdD_Name,fohtwD_HolidayWDType,hrmD_DepartmentName';
    const urlParams = getSearchParamsUrl(searchParams ?? {}, searchableColumns);
    const url = `/api/MasterHoliday/get_master_holiday_grid?${urlParams}`;
    return await api.get<IMasterHolidayList[]>('hrmsfrontoffice', url);
}

/**
 * Save or Update Master Holiday record
 * POST /api/MasterHoliday/save_master_holiday_details
 */
export async function addOrUpdateMasterHoliday(data: any) {
    const url = '/api/MasterHoliday/save_master_holiday_details';
    return await api.post<any>('hrmsfrontoffice', url, data);
}

/**
 * Delete Master Holiday record
 * DELETE /api/MasterHoliday/delete_master_holiday/{id}
 */
export async function deleteMasterHoliday(id: number) {
    const url = `/api/MasterHoliday/delete_master_holiday/${id}`;
    return await api.delete<IMasterHolidayList>('hrmsfrontoffice', url);
}

// GET dates for selected days
// GET /api/MasterHoliday/get_days_details/{days}/{hrmly_id}
export async function getHolidayDatesForDays(data: { hrmlY_Id: number; days: string }) {
    const url = `/api/MasterHoliday/get_days_details/${data.days}/${data.hrmlY_Id}`;
    return await api.get<any>('hrmsfrontoffice', url);
}
