'use server';

import { api } from '@/lib/apiService';

//academic Year
export async function getAcademicYearDropDropDown() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//Category
export async function getCategoryDropDown() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//class
export async function getClassDropdown() {
    const url = '/TimeTableCommon/GetClassData';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//section
export async function getSectionDropDown() {
    const url = '/TimeTableCommon/section-details';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//staff
export async function getStaffDropDown() {
    const url = '/TimeTableCommon/GetStaffDetails';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}

//subject
export async function getSubjectDropDown() {
    const url = '/TimeTableCommon/subject-details';
    const response = await api.get<any[]>('timetable', url);
    return response.data;
}
