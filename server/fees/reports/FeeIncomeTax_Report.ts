'use server';

import { api } from '@/lib/apiService';

export async function getAcademicDropDownDetails(data: any) {
    const url = '/FeesCommon/academic-year-list';
    return await api.get<any>('fees', url, { params: data });
}

export async function getClassDropDownDetails(data: any) {
    const url = '/FeesCommon/class-details';
    return await api.get<any>('fees', url, { params: data });
}

export async function getSectionDropDownDetails(data: any) {
    // const url = '/FeesCommon/section-dropdown-by-class';
    const url = '/FeesCommon/section-dropdown-by-class';
    return await api.get<any>('fees', url, { params: data });
}

export async function getStudentDropDownDetails(data: any) {
    const url = '/feeitreport/get-student-list';
    return await api.get<any>('fees', url, { params: data });
}

export async function getTaxReport(data: any) {
    const url = '/feeitreport/gettaxreport';
    return await api.post<any>('fees', url, data);
}
