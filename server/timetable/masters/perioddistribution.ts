'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { PeriodDistributionColumn, PeriodDropdownData } from '@/types/timetable/masters/masters';

export async function getPeriodDistributionDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmaY_Year,staffName,ttfpD_TotWeekPeriods');
    const url = `/ClassMasterFacade/getPeriodDistributionData?${urlParams}`;
    console.info('PeriodDistributionFacade', url);
    return await api.get<PeriodDistributionColumn[]>('timetable', url);
}

export async function savePeriodDistribution(data: any) {
    const url = '/ClassMaster/savedetail/';
    return await api.post<any>('timetable', url, data);
}

export async function getPeriodDistributionEditDetails(id: number) {
    const url = '/ClassMaster/getdetails';
    return await api.post<any>('timetable', url, { TTFPD_Id: id });
}

export async function deactivatePeriodDistribution(data: any) {
    const url = '/ClassMaster/deactivate';
    return await api.post<any>('timetable', url, data);
}

export async function getClassByCategory(data: any) {
    const url = '/ClassMaster/getclass_catg';
    return await api.post<any>('timetable', url, data);
}
export async function ActivedeactivatePeriodDistribution(id: number) {
    const url = `/ClassMasterFacade/period-distribution-deactivate/${id}`;
    return await api.put<any>('timetable', url);
}

export async function getPeriodDistributionViewData(id: number) {
    const url = `/ClassMasterFacade/all-records-view?TTFPD_Id=${id}`;
    return await api.get<any>('timetable', url);
}

//academic Year
export async function getAcademicYearPeriodDistrubution() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//Category
export async function getCategoryPeriodDistrubution() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//class
export async function getClassPeriodDistrubution() {
    const url = '/TimeTableCommon/GetClassData';
    const response = await api.get<any[]>('timetable', url);
    console.log("response data", url);
    return response.data;
}

//section
export async function getSectionPeriodDistrubution() {
    const url = '/TimeTableCommon/section-details';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//staff
export async function getStaffPeriodDistrubution() {
    const url = '/TimeTableCommon/GetStaffDetails';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//subject
export async function getSubjectPeriodDistrubution() {
    const url = '/TimeTableCommon/subject-details';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

export async function saveperioddistribution(data: any) {
    const url = '/ClassMasterFacade/save-period-distribution';
    console.info('saveperioddistribution', url);
    return await api.post<any>('timetable', url, data);
}

export async function getPeriodDropdown() {
    const url = '/TimeTableCommon/period-details';
    console.log('PeriodDistributionFacade', url);
    return await api.get<PeriodDropdownData[]>('timetable', url);
}

//edit
export async function EditPeriodDistribution(id: number) {
    const url = `/ClassMasterFacade/getalldetailsviewrecords/${id}`;
    console.log('EditPeriodDistribution', url);
    return await api.get<any>('timetable', url);
}
