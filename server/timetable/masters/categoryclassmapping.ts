'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICategoryClassMapping,
    ITimeTableCategoryDropDownData,
    ITimeTableClassDropDownData,
    ITimeTableMasterAcademicYear
} from '@/types/timetable/masters/masters';

export async function getCategoryClassMappingDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'categoryName,className,academicName');
    const url = `/CategoryClassMappFacade/GetCategoryClassMappingGridList?${urlParams}`;
    console.info('MasterDayFacade', url);
    return await api.get<ICategoryClassMapping[]>('timetable', url);
}

export async function addOrUpdateCategoryClassMapping(data: any) {
    const url = '/CategoryClassMappFacade/AddOrUpdateCategoryClassMapping';
    return await api.post<any>('timetable', url, data);
}

export async function ToggleCategoryClassMapping(ttmd_id: number) {
    const url = `/MasterBuildingFacade/MasterBuildingActivateDeactivate//${ttmd_id}`;
    return await api.put<any>('timetable', url);
}

export async function getTimeTableAcademicYearDetails() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('MasterDayFacade', url);
    return await api.get<ITimeTableMasterAcademicYear[]>('timetable', url);
}

export async function getTimeTableCategoryDropDownDetails() {
    const url = '/TTMasterCategoryFacade/GetCategoryDetails';
    console.info('MasterDayFacade', url);
    return await api.get<ITimeTableCategoryDropDownData[]>('timetable', url);
}

export async function getuseTimeTableClassDropdownDataDetails() {
    const url = '/TTMasterCategoryFacade/GetClassData';
    console.info('MasterDayFacade', url);
    return await api.get<ITimeTableClassDropDownData[]>('timetable', url);
}
export async function getuseTimeTableClassDropdownDataDetailsNew(asmay_id: number, ttmc_id: number) {
    const url = `/CategoryClassMappFacade/ClassDataByAcademicYearAndCategory/${asmay_id}/${ttmc_id}`;
    return await api.get<any>('timetable', url);
}
