'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IPeriodAllocationMasterDay } from '@/types/timetable/masters/masters';

export async function getAllPeriodDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmP_PeriodName,asmaY_Year,asmcL_ClassName');
    const url = `/PeriodAllocationFacade/GetMasterDayClassWiseGridData?${urlParams}`;
    return await api.get<IPeriodAllocationMasterDay[]>('timetable', url);
}

export async function savePeriod(data: any) {
    const url = '/PeriodAllocationFacade/PeriodAllocationMasterPeriodSave';
    return await api.post<any>('timetable', url, data);
}

export async function savePeriodPeriodAllocation(data: any) {
    const url = '/TimeTableCommon/AddOrUpdateMasterPeriod';
    return await api.post<any>('timetable', url, data);
}

//Master Period Class save button
export async function savePeriodClass(data: any) {
    const url = '/PeriodAllocationFacade/PeriodDistributionSavedetailClassWise';
    return await api.post<any>('timetable', url, data);
}

export async function deactivatePeriod(TTMP_Id: number) {
    const url = `/PeriodAllocationFacade/MasterPeriodActivateDeactive/${TTMP_Id}`;
    return await api.put<any>('timetable', url);
}

export async function deactivatePeriodClass(TTMPC_Id: number) {
    const url = `/PeriodAllocationFacade/MasterPeriodClassWiseActivateDeactive/${TTMPC_Id}`;
    return await api.put<any>('timetable', url);
}

export async function getPeriodClass(data: any) {
    const url = '/PeriodAllocation/getperiod_class';
    return await api.post<any>('timetable', url, data);
}

//period number
export async function getPeriodDetails(period_count: number) {
    const url = `/PeriodAllocationFacade/getperiod_Details/${period_count}`;
    console.log('getperiod_details', url);
    return await api.get<any>('timetable', url);
}

export async function getClassByCategory(data: any) {
    const url = '/PeriodAllocation/getclass_catg';
    return await api.post<any>('timetable', url, data);
}

export async function getCategory(data: any) {
    const url = '/PeriodAllocation/get_catg';
    return await api.post<any>('timetable', url, data);
}

export async function getPeriodAllocationmasterPeriodGrid(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmP_PeriodName');
    const url = `/PeriodAllocationFacade/PeriodAllocationmasterPeriodgrid?${urlParams}`;
    return await api.get<IPeriodAllocationMasterDay[]>('timetable', url);
}
