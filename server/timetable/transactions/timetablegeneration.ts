'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { AcademicYear, Category } from '@/types/timetable/Transaction/timetablegeneration';

export async function getAcademicYear(data?: any) {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('TimeTableCommon', url);
    return await api.get<AcademicYear>('timetable', url);
}

export async function getCategory(data?: any) {
    const url = '/TimeTableCommon/GetCategoryDetails';
    console.info('TimeTableCommon', url);
    return await api.get<Category>('timetable', url);
}

export async function getGenerationMasters() {
    const [yearsResponse, categoriesResponse] = await Promise.all([getAcademicYear(), getCategory()]);

    return {
        years: (yearsResponse.data || []) as AcademicYear[],
        categories: (categoriesResponse.data || []) as Category[]
    };
}

export async function getTimeTableGenerationGridData(searchParams: any) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, '');
    const url = `/TimeTableGenerationFacade/GetTTGenerationGrid?${urlParams}`;
    console.info('TimeTableGenerationFacade', url);
    return await api.get<any>('timetable', url);
}

export async function toggleTimeTableGeneration(ttfG_Id: number) {
    const url = `/TimeTableGenerationFacade/ActivateOrDeactivateTT/${ttfG_Id}`;
    console.info('TimeTableGenerationFacade', url);
    return await api.get<any>('timetable', url);
}

export async function getGenerationDetails(asmaY_Id: number, ttmC_Id: number) {
    const url = `/TimeTableGenerationFacade/GetGenerationDetails/${asmaY_Id}/${ttmC_Id}`;
    console.info('TimeTableGenerationFacade', url);
    return await api.get<any>('timetable', url);
}

export async function generateTT(payload: { asmaY_Id: number; ttmc_idslist: { ttmC_Id: number }[] }) {
    const url = '/TimeTableGenerationFacade/GenerateTT';
    console.info('TimeTableGenerationFacade', url);
    return await api.post<any>('timetable', url, payload);
}

export async function resetTT(payload: { asmaY_Id: number }) {
    const url = '/TimeTableGenerationFacade/ResetTT';
    console.info('TimeTableGenerationFacade', url);
    return await api.post<any>('timetable', url, payload);
}

export async function getGenerationCounts(payload: { asmaY_Id: number; ttmc_idslist: { ttmC_Id: number }[] }) {
    const url = '/TimeTableGenerationFacade/get_count';
    console.info('TimeTableGenerationFacade', url);
    return await api.post<any>('timetable', url, payload);
}
