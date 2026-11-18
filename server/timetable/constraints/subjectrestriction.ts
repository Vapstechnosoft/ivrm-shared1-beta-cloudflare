'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';

// --- Shared Dropdowns ---
// Reusing getCategory, getClassDetails, etc. might be possible, but endpoints might be different.
// Checking legacy code: `Restriction/savedetail1`, `Restriction/savedetail2`, etc.
// `Restriction/getpagedetails1`, `Restriction/getpagedetails2`, etc.

export async function getSubjectRestrictionDetails() {
    const url = '/RestrictionFacade/getdetailsRestrictions'; // Assuming generic load
    return await api.get<any>('timetable', url);
}

export async function getSubjectRestrictionDetailsRestrictions() {
    const url = '/RestrictionFacade/getdetailsRestrictions';
    return await api.get<any>('timetable', url);
}

// --- Tab 1: Day Period ---

//day period grid

export async function getSubjectRestrictionDayPeriodGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmaY_Year,ttmC_CategoryName,asmcL_ClassName,asmC_SectionName,staffName,ismS_SubjectName,ttmD_DayName,ttmP_PeriodName,ttfdP_Id,ttfdP_ActiveFlag'
    );
    const url = `/RestrictionFacade/SubjectRestrictionDayPeriodGridData?${urlParams}`;
    return await api.get<any[]>('timetable', url);
}

//save
export async function saveDayPeriodDetail(data: any) {
    const url = '/RestrictionFacade/TTRestrictionDayPeriodSave';
    return await api.post<any>('timetable', url, data);
}

//toggle
export async function ToggleSubjectDayPeriod(ttrdP_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionDayPeriodActivateDeactivate/${ttrdP_Id}`;
    return await api.put<any>('timetable', url);
}

//edit button
export async function getSubjectRestrictionDayPeriodDetails(id: number) {
    const url = `/RestrictionFacade/DayPeriodEdit/${id}`;
    console.info('Fetching Subject Restriction Day Period details:', url);
    return await api.get<any>('timetable', url);
}

// --- Tab 2: Day Staff ---

//day staff grid

export async function getSubjectRestrictionDayStaffGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmaY_Year,staffName,ttmD_DayName,ttfdS_Id,ttfdS_ActiveFlag');
    const url = `/RestrictionFacade/SubjectRestrictionDayStaffGridData?${urlParams}`;
    console.log('day staff grid data', url);
    return await api.get<any[]>('timetable', url);
}

//save button
export async function saveDayStaffDetail(data: any) {
    const url = '/RestrictionFacade/TTRestrictionDayStaffSave';
    return await api.post<any>('timetable', url, data);
}

//edit button
export async function getDayStaffEditDetails(id: number) {
    const url = `/RestrictionFacade/DayStaffEdit/${id}`;
    return await api.get<any>('timetable', url);
}

//toggle
export async function ToggleSubjectDayStaff(ttrdS_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionDayStaffActivateDeactivate/${ttrdS_Id}`;
    return await api.put<any>('timetable', url);
}

// --- Tab 3: Day Subject ---
//subject and period subject

// day subject grid

export async function getSubjectRestrictionDaySubjectGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmaY_Year,ismS_SubjectName,ttmD_DayName,ttfdsU_Id,ttfdsU_ActiveFlag,ttfdsU_SUbSelcFlag'
    );
    const url = `/RestrictionFacade/SubjectRestrictionDaySubjectGridData?${urlParams}`;
    return await api.get('timetable', url);
}

//Button
export async function saveDaySubjectDetail(data: any) {
    const url = '/RestrictionFacade/TTRestrictionDaySubjectSave';
    return await api.post<any>('timetable', url, data);
}

//edit button
export async function getDaySubjectEditDetails(id: number) {
    const url = `/RestrictionFacade/DaySubjectEdit/${id}`;
    return await api.get<any>('timetable', url);
}

//toggle
export async function ToggleSubjectDaySubject(ttrdsU_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionDaySubjectActivateDeactivate/${ttrdsU_Id}`;
    return await api.put<any>('timetable', url);
}
// --- Tab 4: Period Staff ---

//period staff grid
export async function getSubjectRestrictionPeriodStaffGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmaY_Year,staffName,ttmP_PeriodName,ttfpS_Id,ttfpS_ActiveFlag,ttfpS_SUbSelcFlag,ttfpscC_Id'
    );
    const url = `/RestrictionFacade/SubjectRestrictionPeriodStaffGridData?${urlParams}`;
    return await api.get('timetable', url);
}

// save button
export async function savePeriodStaffDetail(data: any) {
    const url = '/RestrictionFacade/TTRestrictionDayPeriodStaffSave';
    return await api.post<any>('timetable', url, data);
}

//edit button
export async function getPeriodStaffEditDetails(id: number) {
    const url = `/RestrictionFacade/PeriodStaffEdit/${id}`;
    return await api.get<any>('timetable', url);
}

//toggle
export async function ToggleSubjectPeriodStaff(ttrpS_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionPeriodStaffActivateDeactivate/${ttrpS_Id}`;
    return await api.put<any>('timetable', url);
}

// --- Tab 5: Period Subject ---

//period subject grid
export async function getSubjectRestrictionPeriodSubjectGridData(searchParams?: any) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmaY_Year,ismS_SubjectName,ttmP_PeriodName,ttfpsU_Id,ttfpsU_ActiveFlag,ttfpsU_SUbSelcFlag,ttrpsU_Id,ttrpsU_SUbSelcFlag'
    );
    const url = `/RestrictionFacade/SubjectRestrictionPeriodSubjectGridData?${urlParams}`;
    return await api.get('timetable', url);
}

//save button
export async function savePeriodSubjectDetail(data: any) {
    const url = '/RestrictionFacade/TTRestrictionDayPeriodSubjectSave';
    return await api.post<any>('timetable', url, data);
}

//edit button
export async function getPeriodSubjectEditDetails(id: number) {
    const url = `/RestrictionFacade/PeriodSubjectEdit/${id}`;
    return await api.get<any>('timetable', url);
}

//toggle
export async function ToggleSubjectPeriodSubject(ttrpsU_Id: number) {
    const url = `/RestrictionFacade/SubjectRestrictionPeriodSubjectActivateDeactivate/${ttrpsU_Id}`;
    return await api.put<any>('timetable', url);
}

// --- Helper Dropdown Fetchers ---
// Assuming standard ones exist or using specific controller endpoints
export async function getCategoryDetails(data: { ASMAY_Id: number }) {
    const url = '/Restriction/get_category'; // Guessing
    // Legacy: get_category1() -> calls 'Restriction/get_category' (implied)
    return await api.post<any>('timetable', '/Restriction/get_category', data);
}

//academic Year
export async function getAcademicYearSubject() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    const response = await api.get<any>('timetable', url);
    return response.data;
}
//Category
export async function getCategorySubject() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    const response = await api.get<any>('timetable', url);
    return response.data;
}

//for daystaff and period staff and period subject
export async function getAcademicYearDayStaff() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    const response = await api.get<any>('timetable', url);
    return response.data;
}
//staff and for period staff also
export async function getStaffDropDownDayStaff() {
    const url = '/TimeTableCommon/GetStaffDetails';
    const response = await api.get<any>('timetable', url);
    return response.data;
}

//subject drop down
export async function getSubjectDaySubject() {
    const url = '/TimeTableCommon/subject-details';
    const response = await api.get<any>('timetable', url);
    return response.data;
}
