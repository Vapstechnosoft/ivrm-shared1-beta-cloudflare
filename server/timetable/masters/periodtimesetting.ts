'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IPeriodTimeSettingData } from '@/types/timetable/masters/masters';

export async function getAllPeriodTimeSettings(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'ttmC_CategoryName,ttmP_PeriodName,ttmD_DayName,asmaY_Year,ttmdpT_StartTime,ttmdpT_EndTime'
    );
    const url = `/PeriodTimeSettingFacade/GetPeriodTimeSettingData?${urlParams}`;
    return await api.get<IPeriodTimeSettingData[]>('timetable', url);
}

export async function savePeriodTimeSetting(data: any) {
    const url = '/PeriodTimeSettingFacade/PeriodTimeSettingSavedetail';
    return await api.post<any>('timetable', url, data);
}

export async function deactivatePeriodTimeSetting(ttmdpT_Id: number) {
    const url = `/PeriodTimeSettingFacade/activatedeactivate/${ttmdpT_Id}`;
    return await api.put<any>('timetable', url);
}

export async function getPeriodTimeSettingDetails(id: number) {
    const data = { TTMDPT_Id: id };
    const url = '/PeriodTimeSetting/getpagedetails';
    return (await api.post<any>('timetable', url, data)) as any;
}
