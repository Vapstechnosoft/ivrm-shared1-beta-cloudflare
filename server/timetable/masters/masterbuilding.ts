'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterBuildClassSectionGrid, IMasterDayList } from '@/types/timetable/masters/masters';

export async function getMasterBuildingDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmB_BuildingName');
    const url = `/MasterBuildingFacade/GetMasterBuildingGridList?${urlParams}`;
    console.info('MasterDayFacade', url);
    return await api.get<IMasterDayList[]>('timetable', url);
}

export async function addOrUpdateMasterBuilding(data: any) {
    const url = '/MasterBuildingFacade/AddorUpdateMasterBuilding';
    return await api.post<any>('timetable', url, data);
}

export async function ToggleMasterBuilding(ttmd_id: number) {
    const url = `/MasterBuildingFacade/MasterBuildingActivateDeactivate/${ttmd_id}`;
    return await api.put<any>('timetable', url);
}

export async function getMasterBuildingclasssectionDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmB_BuildingName,asmcL_ClassName,asmC_SectionName');
    const url = `/MasterBuildingFacade/GetMasterBuildingClassSectionGridList?${urlParams}`;
    console.info('GetMasterBuildingClassSectionGridList', url);
    return await api.get<IMasterBuildClassSectionGrid[]>('timetable', url);
}

export async function getMasterBuilding() {
    const url = '/MasterBuildingFacade/GetBuildingDropDown';
    return await api.get<any>('timetable', url);
}

export async function getMasterClass() {
    const url = '/MasterBuildingFacade/GetClassDropDown';
    return await api.get<any>('timetable', url);
}

export async function getMasterSection() {
    const url = '/MasterBuildingFacade/GetSectionDropDown';
    return await api.get<any>('timetable', url);
}

export async function addOrUpdateMasterBuildingclasssection(data: any) {
    const url = '/MasterBuildingFacade/AddorUpdateMasterBuildingClassSection';
    return await api.post<any>('timetable', url, data);
}

export async function ToggleMasterBuildingClassSection(ttmbcS_Id: number) {
    const url = `/MasterBuildingFacade/MasterBuildingClassSectionActivateDeactivate/${ttmbcS_Id}`;
    return await api.put<any>('timetable', url);
}
