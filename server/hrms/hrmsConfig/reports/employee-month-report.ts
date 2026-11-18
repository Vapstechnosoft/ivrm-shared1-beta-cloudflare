'use server';

import { api } from '@/lib/apiService';

/**
 * Get Employee Month Report data
 * GET /api/FrontOfficeMonthEndReport/get_month_end_report/{academicYear}/{month}
 */
export async function getEmployeeMonthEndReport(data: any) {
    const url = `/api/FrontOfficeMonthEndReport/get_month_end_report/${data.year}/${data.month}`;
    return await api.get<any>('hrmsfrontoffice', url);
}
