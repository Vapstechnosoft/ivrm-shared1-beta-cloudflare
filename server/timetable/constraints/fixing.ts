'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type {
    FixingDayPeriodSchema,
    FixingDayStaffSchema,
    FixingDaySubjectSchema,
    FixingPeriodStaffSchema,
    FixingPeriodSubjectSchema
} from '@/schemas/timetable/constraints/fixing';
import type { ApiSearchparams } from '@/types';
import type { ITTFixingLoadData } from '@/types/timetable/constraints';
import type { TTDayPeriodGridData, TTDayStaffGridData } from '@/types/timetable/constraints/fixing';

export async function getFixingLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ttmC_CategoryName');
    const url = `/TTMasterCategoryFacade/GetMasterCategoryGridList?${urlParams}`;
    return await api.get<ITTFixingLoadData[]>('timetable', url);
}

// -------------------------------------------------------------------------
// Tab 1: Day Period
// -------------------------------------------------------------------------

export async function saveFixingDayPeriod(data: FixingDayPeriodSchema) {
    const url = '/FixingFacade/FixingPeriodDaySave';
    // /FixingFacade/FixingDaySubjectSave
    return await api.post<any>('timetable', url, data);
}

//EDIT
export async function getFixingDayPeriodDetails(id: number) {
    const url = `/FixingFacade/DayPeriodEdit/${id}`;
    console.info('Fetching Day Period details:', url);
    return await api.get<any>('timetable', url);
}

//gird
export async function getFixingDayPeriodGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmaY_Year,ttmC_CategoryName,asmcL_ClassName,asmC_SectionName,staffName,ismS_SubjectName,ttmD_DayName,ttmP_PeriodName,ttfdP_Id,ttfdP_ActiveFlag'
    );
    const url = `/FixingFacade/DayPeriodGridData?${urlParams}`;
    return await api.get<TTDayPeriodGridData[]>('timetable', url);
}

export async function deactivateFixingDayPeriod(data: { TTFDP_Id: number; TTFDP_ActiveFlag: boolean }) {
    const url = `/FixingFacade/FixingdayPeriodActivateDeactivate/${data.TTFDP_Id}`;
    return await api.put<any>('timetable', url, data);
}

// export async function ToggleMasterDay(ttmd_id: number) {
//     const url = `/MasterDayFacade/MasterDaydayActivateDeactivate/${ttmd_id}`;
//     return await api.put<any>('timetable', url);
// }

// -------------------------------------------------------------------------
// Tab 2: Day Staff
// -------------------------------------------------------------------------

export async function saveFixingDayStaff(data: FixingDayStaffSchema) {
    const url = '/FixingFacade/FixingDayStaffSave';
    return await api.post<any>('timetable', url, data);
}

//EDIT
export async function getFixingDayStaffDetails(id: number) {
    const url = `/FixingFacade/DayStaffEdit/${id}`;
    console.info('Fetching Day Staff details:', url);
    return await api.get<any>('timetable', url);
}

export async function deactivateFixingDayStaff(data: { TTFDS_Id: number; TTFDS_ActiveFlag: boolean }) {
    const url = `/FixingFacade/FixingDayStaffActivateDeactivate/${data.TTFDS_Id}`;
    return await api.put<any>('timetable', url, data);
}

// -------------------------------------------------------------------------
// Tab 3: Day Subject
// -------------------------------------------------------------------------

export async function saveFixingDaySubject(data: FixingDaySubjectSchema) {
    const url = '/FixingFacade/FixingDaySubjectSave';
    // /FixingFacade/FixingDaySubjectSave
    console.log('Saving Day Subject with data:', data);
    return await api.post<any>('timetable', url, data);
}

//EDIT
export async function getFixingDaySubjectDetails(id: number | string) {
    const url = `/FixingFacade/DaySubjectEdit/${id}`;
    console.info('Fetching Day Subject details:', url);
    return await api.get<any>('timetable', url);
}

export async function deactivateFixingDaySubject(data: { TTFDSU_Id: number; TTFDSU_ActiveFlag: boolean }) {
    const url = `/FixingFacade/FixingDaySubjectActivateDeactivate/${data.TTFDSU_Id}`;
    return await api.put<any>('timetable', url, data);
}

// -------------------------------------------------------------------------
// Tab 4: Period Staff
// -------------------------------------------------------------------------

//save
export async function saveFixingPeriodStaff(data: FixingPeriodStaffSchema) {
    const url = '/FixingFacade/FixingDayPeriodStaffSave';
    return await api.post<any>('timetable', url, data);
}

//EDIT
export async function getFixingPeriodStaffDetails(id: number | string) {
    const url = `/FixingFacade/PeriodStaffEdit/${id}`;
    console.info('Fetching Period Staff details:', url);
    return await api.get<any>('timetable', url);
}

export async function deactivateFixingPeriodStaff(data: { TTFPS_Id: number; TTFPS_ActiveFlag: boolean }) {
    const url = `/FixingFacade/FixingDayPeriodStaffActivateDeactivate/${data.TTFPS_Id}`;
    return await api.put<any>('timetable', url, data);
}

// -------------------------------------------------------------------------
// Tab 5: Period Subject
// -------------------------------------------------------------------------

export async function saveFixingPeriodSubject(data: FixingPeriodSubjectSchema) {
    const url = '/FixingFacade/FixingDayPeriodSubjectSave';
    return await api.post<any>('timetable', url, data);
}

//EDIT
export async function getFixingPeriodSubjectDetails(id: number | string) {
    const url = `/FixingFacade/PeriodSubjectEdit/${id}`;
    console.info('Fetching Period Subject details:', url);
    return await api.get<any>('timetable', url);
}

export async function deactivateFixingPeriodSubject(data: { TTRPSU_Id: number; TTRPSU_ActiveFlag: boolean }) {
    const url = `/FixingFacade/FixingDayPeriodSubjectActivateDeactivate/${data.TTRPSU_Id}`;
    return await api.put<any>('timetable', url, data);
}

// -------------------------------------------------------------------------
// Dropdown Helpers (Reused from Fixing Controller in backend)
// -------------------------------------------------------------------------

export async function getClassByCategory(data: { ASMAY_Id: number; TTMC_Id: number }) {
    const url = '/Fixing/getclass_catg';
    return await api.post<any>('timetable', url, data);
}

export async function getStaffByFixing(data: { ASMAY_Id: number; TTMC_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    const url = '/FixingFacade/getstaffandmaxvaluedata';
    return await api.post<any>('timetable', url, data);
}

export async function getSubjectByStaff(data: {
    ASMAY_Id: number;
    TTMC_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    HRME_Id?: number;
}) {
    const url = '/FixingFacade/subject_by_staff';
    return await api.post<any>('timetable', url, data);
}

//day subject forms form
export async function getFixingClassSectionStaffsBySubject(asmay_id: number, isms_id: number) {
    const url = `/FixingFacade/get_cls_sec_staffsData/${asmay_id}/${isms_id}`;

    console.info('FixingFacade/get_cls_sec_staffsData', url);
    return await api.get<any>('timetable', url);
}

//day staff forms form
export async function getFixingClassSectionSubjectByStaff(asmay_id: number, hrme_id: number) {
    const url = `/FixingFacade/get_cls_sec_subsData/${asmay_id}/${hrme_id}`;
    return await api.get<any>('timetable', url);
}

export { getSubjectByStaff as getSubjectByFixing };

// Check backend for this one, usually implied by standard 'getalldetails' often returning periods/days/categories
// But for dependent logic:
// getperiod_class
// getsection_class
// If these exist, we implement them.
// Legacy: `get_period_section1` -> gets period and section?
// Actually usually `getclass_catg` might return sections too?
// Let's implement generic fetches if needed.

export async function getPeriodByClass(data: { ASMAY_Id: number; ASMCL_Id: number }) {
    const url = '/Fixing/getperiod_class'; // Guessing the endpoint name based on convention
    return await api.post<any>('timetable', url, data);
}

export async function getSectionByClass(data: { ASMAY_Id: number; ASMCL_Id: number; TTMC_Id: number }) {
    const url = '/Fixing/getsection_class';
    return await api.post<any>('timetable', url, data);
}

export async function getFixingDaySubjectGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmaY_Year,ismS_SubjectName,ttmD_DayName,ttfdsU_Id,ttfdsU_ActiveFlag,ttfdsU_SUbSelcFlag'
    );
    const url = `/FixingFacade/DaySubjectGridData?${urlParams}`;

    return await api.get('timetable', url);
}

export async function getFixingDayStaffGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmaY_Year,staffName,ttmD_DayName,ttfdS_Id,ttfdS_ActiveFlag');
    const url = `/FixingFacade/DayStaffGridData?${urlParams}`;
    console.log('day staff grid data', url);
    return await api.get<TTDayStaffGridData[]>('timetable', url);
}

export async function getFixingPeriodSubjectGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmaY_Year,ismS_SubjectName,ttmP_PeriodName,ttfpsU_Id,ttfpsU_ActiveFlag,ttfpsU_SUbSelcFlag,ttrpsU_Id,ttrpsU_SUbSelcFlag'
    );
    const url = `/FixingFacade/PeriodSubjectGridData?${urlParams}`;
    return await api.get('timetable', url);
}

export async function getFixingPeriodStaffGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmaY_Year,staffName,ttmP_PeriodName,ttfpS_Id,ttfpS_ActiveFlag,ttfpS_SUbSelcFlag,ttfpscC_Id'
    );
    const url = `/FixingFacade/PeriodStaffGridData?${urlParams}`;
    return await api.get('timetable', url);
}

export async function getFixingClassDropdown(asmay_id: number, ttmc_id: number) {
    const url = `/MasterDayFacade/ClassDataByAcademicyrandCategory/${asmay_id}/${ttmc_id}`;
    return await api.get<any[]>('timetable', url);
}

export async function getdetailsAllFixing() {
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    const url = `/FixingFacade/getdetailsAllFixing`;
    return await api.get<any>('timetable', url);
}

export async function getSectionDropdownByClassCategory(asmay_id: number, asmcl_id: number, ttmc_id: number) {
    const url = `/FixingFacade/GetPeriodsAndClass/${asmay_id}/${asmcl_id}/${ttmc_id}`;
    return await api.get<any>('timetable', url);
}
