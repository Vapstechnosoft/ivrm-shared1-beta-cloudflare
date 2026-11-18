'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { BreakTimeSettingsGridData, IBreakTimeSettingsDTO } from '@/types/timetable/masters/masters';

export async function getBreakTimeSettingsDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'ttmB_Id,asmayYear,dayName,className,ttmB_BreakName,ttmB_BreakStartTime,ttmB_BreakEndTime,ttmB_AfterPeriod,ttmB_ActiveFlag'
    );
    const url = `/BreaktimesettingsFacade/BreakTimeSettingsGridData?${urlParams}`;
    console.info('BreakTimeSettings', url);
    return await api.get<BreakTimeSettingsGridData[]>('timetable', url);
}

export async function saveBreakTimeSettings(data: IBreakTimeSettingsDTO) {
    const url = '/BreaktimesettingsFacade/Breaktimesettingssavedetail';
    return await api.post<any>('timetable', url, data);
}

export async function deleteBreakTimeSettings(ttmb_id: number) {
    const url = `/BreaktimesettingsFacade/deletepages/${ttmb_id}`;
    return await api.delete<any>('timetable', url);
}

export async function deactivateBreakTimeSettings(data: any) {
    const url = '/BreaktimesettingsFacade/deactivate';
    return await api.post<any>('timetable', url, data);
}

//edit button
export async function getBreakTimeSettingsEdit(id: number) {
    // /api/BreaktimesettingsFacade/getEditdetails/{id}
    const url = `/BreaktimesettingsFacade/getEditdetails/${id}`;
    console.log('getBreakTimeSettingsEdit', url);
    return await api.get<any>('timetable', url);
}

export async function getMaximumPeriodsCount(classid: number, classcount: number) {
    //  const url = `/BreaktimesettingsFacade/getmaximumperiodscount/${classid}/${classcount}/`;
    const url = `/BreaktimesettingsFacade/getmaximumperiodscount/$${classid}/$${classcount}/`;
    console.info('getMaximumPeriodsCount URL:', url);
    return await api.get<any>('timetable', url);
}

export async function getClassByCategory(data: any) {
    const url = '/BreakTimeSettings/getclass_catg';
    return await api.post<any>('timetable', url, data);
}

export async function getCategoryByAcademicYear(data: any) {
    const url = '/BreakTimeSettings/get_catg';
    return await api.post<any>('timetable', url, data);
}

//toggle button
export async function getBreakTimeSettingsToggle(ttmb_id: number) {
    const url = `/BreaktimesettingsFacade/deactivateToggleButton/${ttmb_id}`;
    return await api.put<any>('timetable', url);
}
