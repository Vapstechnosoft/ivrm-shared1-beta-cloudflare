'use server';

import { api } from '@/lib/apiService';

export async function getInvRMonthEndReportLoadData() {
    return await Promise.all([
        api.get<any>('inventory', `/INV_MonthEndReportFacade/loadmonth`),
        api.get<any>('inventory', `/INV_MonthEndReportFacade/loadacademicyear`)
    ]).then(([monthRes, yearRes]) => ({
        success: true,
        month_array: monthRes.data ?? monthRes,
        acayear: yearRes.data ?? yearRes
    }));
}

export async function getInvRMonthEndReport(payload: any) {
    return await api.post<any>('inventory', '/INV_MonthEndReportFacade/getmonthreport', payload);
}
