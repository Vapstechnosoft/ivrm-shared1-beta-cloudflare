'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { labConstraints } from '@/types/timetable/constraints/labconstraints';

// Load initial data (Grid and Dropdowns)

// // Get Lab (Subject?) details based on Class/Section
// export async function getLabDetails() {
//     const url = '/Lab/getLabdetails';
//     return await api.post<any>('timetable', url);
// }

// // Save Lab Constraints
// export async function saveLabConstraintsDetail(data: any) {
//     const url = '/Lab/savedetail';
//     return await api.post<any>('timetable', url, data);
// }

// // Get Details for Edit
// export async function getLabConstraintsEditDetails(id: number) {
//     const url = `/Lab/getdetails/${id}`;
//     return await api.get<any>('timetable', url);
// }

// // Delete/Deactivate Record
// export async function deleteLabConstraintsDetail(id: number) {
//     const url = `/Lab/deletedetails/${id}`;
//     return await api.delete<any>('timetable', url);
// }

// //form pages

// //category
// export async function getTimeTableCategoryDropDownDetails() {
//     const url = '/TimeTableCommon/GetCategoryDetails';
//     console.info('LabConstraints', url);
//     return await api.get<labConstraints[]>('timetable', url);
// }

// //academic year
// export async function getAcademicYear() {
//     const url = '/TimeTableCommon/GetAcademicYearData';
//     console.info('BifurcationConstratins-AcademicYear', url);
//     return await api.get<labConstraints[]>('timetable', url);
// }

// //class
// export async function getClassDetails() {
//     const url = '/TimeTableCommon/GetClassData';
//     return await api.get<any[]>('timetable', url);
// }

// //section
// export async function getSectionDetails() {
//     const url = '/TimeTableCommon/GetSectionData';
//     return await api.get<any[]>('timetable', url);
// }

export async function LabConstraintsGrid(searchParams?: any) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmayYear,categoryName,ttlaB_LABLIBName,ttlaB_Id,ttlaB_ActiveFlag');
    const url = `/LabconstraintsFacade/LabConstraintsGridData?${urlParams}`;
    console.log('day staff grid data', url);
    return await api.get<labConstraints[]>('timetable', url);
}

export async function getAcademicYearDropDownClasswise() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    return await api.get<labConstraints[]>('timetable', url);
}

export async function getCategoryDropDown() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    return await api.get<any[]>('timetable', url);
}

export async function getClassDropdown() {
    const url = '/TimeTableCommon/GetClassData';
    return await api.get<any[]>('timetable', url);
}

export async function getSectionDropDown() {
    const url = '/TimeTableCommon/section-details';
    return await api.get<any[]>('timetable', url);
}

export async function getSubjectDropDown() {
    const url = '/TimeTableCommon/subject-details';
    return await api.get<any[]>('timetable', url);
}

export async function getLabDropDown() {
    const url = '/TimeTableCommon/get_catg';
    return await api.get<any[]>('timetable', url);
}

//save button
export async function getLabDetails(data: any) {
    const url = '/LabconstraintsFacade/LabSaveDetails';
    console.log('Lab Constraints Save URL:', url);
    return await api.post<any>('timetable', url, data);
}

export async function getLabConstraintsEditDetails(id: number) {
    const url = `/LabconstraintsFacade/LabConstraintsEdit/${id}`;
    console.log('Lab Constraints Edit URL:', url);
    return await api.get<any>('timetable', url);
}

//toggle button
export async function deactivateLabConstraints(id: number) {
    const url = `/LabconstraintsFacade/LabConstraintsToggle/${id}`;
    console.log('Lab Constraints Toggle URL:', url);
    return await api.put<any>('timetable', url, {});
}

//delete
export async function deleteLabConstraints(id: number) {
    const url = `/LabconstraintsFacade/LabConstraintsDelete/${id}`;
    console.log('Lab Constraints Delete URL:', url);
    return await api.delete<any>('timetable', url);
}
