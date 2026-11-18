'use server';

import { api } from '@/lib/apiService';
import type {
    AcademicYear,
    Category,
    Class,
    ClassDropdownDatamanualPeriodInsertion,
    Section,
    Staff,
    Subject
} from '@/types/timetable/Transaction/manualperiodinsertion';

import { auth } from '@/lib/auth';

export async function getAcademicYearData() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('TimeTableCommon', url);
    return await api.get<AcademicYear[]>('timetable', url);
}

export async function getCategoryDetails() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    console.info('TimeTableCommon', url);
    return await api.get<Category[]>('timetable', url);
}

export async function getClassData() {
    const url = '/TimeTableCommon/GetClassData';
    console.info('TimeTableCommon', url);
    return await api.get<Class[]>('timetable', url);
}

export async function getStaffDetails() {
    const url = '/TimeTableCommon/GetStaffDetails';
    console.info('TimeTableCommon', url);
    return await api.get<Staff[]>('timetable', url);
}

export async function getSubjectDetails() {
    const url = '/TimeTableCommon/subject-details';
    console.info('TimeTableCommon', url);
    return await api.get<Subject[]>('timetable', url);
}

export async function getManualPeriodInsertionMasters() {
    const [years, categories, classes, staff, subjects] = await Promise.all([
        getAcademicYearData(),
        getCategoryDetails(),
        getClassData(),
        getStaffDetails(),
        getSubjectDetails()
    ]);

    return {
        years: years.data ?? [],
        categories: categories.data ?? [],
        classes: classes.data ?? [],
        staff: staff.data ?? [],
        subjects: subjects.data ?? []
    };
}

export async function getSectionsByClass(asmcL_Id: number) {
    const url = `/TimeTableCommon/GetSectionData/${asmcL_Id}`;
    console.info('TimeTableCommon', url);
    return await api.get<Section[]>('timetable', url);
}

export async function getClassDetailsByacademicyrandcategoty(asmay_id: number, TTMC_Id: number) {
    const url = `/MasterDayFacade/ClassDataByAcademicyrandCategory/${asmay_id}/${TTMC_Id}`;
    console.info('MasterDayFacade', url);
    return await api.get<ClassDropdownDatamanualPeriodInsertion[]>('timetable', url);
}



export async function getManualPeriodInsertionReportData(payload: any) {
    const url = '/ManualperiodinsertionFacade/ManualPeriodInsertionReportdata';
    console.info('ManualperiodinsertionFacade', url, payload);
    const res = await api.post<any>('timetable', url, payload);
    // console.log('MANUAL PERIOD REPORT DATA RESPONSE:', JSON.stringify(res, null, 2));
    return res;
}

export async function saveManualPeriodInsertion(payload: any) {
    const url = '/ManualperiodinsertionFacade/savemanualPeriodinsertion';
    console.info('ManualperiodinsertionFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}
