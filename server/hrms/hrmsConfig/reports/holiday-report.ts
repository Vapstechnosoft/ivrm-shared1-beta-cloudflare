'use server';

import { api } from '@/lib/apiService';

/**
 * Get holiday report data
 * POST /api/HolidayReportFacade/search
 */
export async function getHolidayReport(hrmlY_Id: number, fohwdT_Id: number) {
    const url = `/api/HolidayReport/get_holiday_report/${hrmlY_Id}/${fohwdT_Id}`;
    return await api.get<any>('hrmsfrontoffice', url);
}
