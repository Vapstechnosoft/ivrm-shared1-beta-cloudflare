'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    Category,
    Class,
    Section,
    Staff,
    StaffReplacementGridData,
    Subject
} from '@/types/timetable/Transaction/staffreplacementexistingtonew';

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

export async function getStaffReplacementExistingToNewMasters() {
    const [categories, classes, staff, subjects] = await Promise.all([
        getCategoryDetails(),
        getClassData(),
        getStaffDetails(),
        getSubjectDetails()
    ]);

    return {
        categories: categories.data || [],
        classes: classes.data || [],
        staff: staff.data || [],
        subjects: subjects.data || []
    };
}

export async function getSectionsByClass(asmcL_Id: number) {
    const url = `/TimeTableCommon/GetSectionData/${asmcL_Id}`;
    console.info('TimeTableCommon', url);
    return await api.get<Section[]>('timetable', url);
}

export async function getSectionDropdown() {
    const url = '/TimeTableCommon/section-details';
    console.info('TimeTableCommon', url);
    return await api.get<any>('timetable', url);
}

export async function getStaffReplacementGridData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'ttmC_Id,ttmD_DayName,ttmD_DayCode,ismS_SubjectName,asmcL_ClassName,asmC_SectionName,staffName,ttmP_PeriodName'
    );
    const url = `/StaffReplacementForClassSectionFacade/GetstaffreplacementfromexistingtonewGrid?${urlParams}`;
    console.info('StaffReplacementForClassSectionFacade', url);
    return await api.get<StaffReplacementGridData[]>('timetable', url);
}

export async function getStaffReplacementInitialData() {
    const url = '/StaffReplacementFromExistingToNewFacade';
    console.info('StaffReplacementFromExistingToNewFacade', url);
    return await api.get<any>('timetable', url);
}

export async function getStaffReplacementInitialDetails(id = 0) {
    const url = `/StaffReplacementFromExistingToNewFacade/getdetails/${id}`;
    console.info('StaffReplacementFromExistingToNewFacade', url);
    return await api.get<any>('timetable', url);
}

export async function saveStaffReplacementExistingToNew(payload: any) {
    const url = '/StaffReplacementFromExistingToNewFacade/savedetail';
    console.info('StaffReplacementFromExistingToNewFacade', url);
    const data = {
        ttmC_Id: Number(payload.ttmC_Id),
        asmcL_Id: Number(payload.asmcL_Id || 0),
        asmS_Id: Number(payload.asms_Id || 0),
        staf_from: Number(payload.hrmE_Id_From),
        staf_to: Number(payload.hrmE_Id_To),
        ismS_Id: Number(payload.ismS_Id || 0)
    };
    return await api.post<any>('timetable', url, data);
}
