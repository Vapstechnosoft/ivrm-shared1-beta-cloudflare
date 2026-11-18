'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ClassDropdownDataTTBifurcation,
    SectionDropdownDataBifurcation,
    StaffDropdownDataBifurcation,
    SubjectDropdownData,
    bifurcationconstraints
} from '@/types/timetable/constraints/bifurcationconstraints';

export async function getBifurcationConstraintsDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'acdYear,categoryName,bifricationName,periodname,ttB_Id,ttB_ActiveFlag');
    const url = `/BifurcationFacade/BifurcationConstraintsGridData?${urlParams}`;
    console.info('BifurcationFacade', url);
    return await api.get<bifurcationconstraints[]>('timetable', url);
}

// Get Class details based on Academic Year and Category
export async function getTimeTableCategoryDropDownDetails(searchParams: ApiSearchparams | undefined) {
    const url = '/TimeTableCommon/GetCategoryDetails';
    console.info('BifurcationConstraints', url);
    return await api.get<bifurcationconstraints[]>('timetable', url);
}

export async function getAcademicYear(searchParams: ApiSearchparams | undefined) {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('BifurcationConstratins-AcademicYear', url);
    return await api.get<any>('timetable', url);
}

// Get Class details based on Academic Year and Category
export async function getClassDetails(TTMC_Id: number) {
    const url = `/BifurcationFacade/GetClassBasedOncategory/${TTMC_Id}`;
    return await api.get<ClassDropdownDataTTBifurcation[]>('timetable', url);
}

// Get Staff based on Class and Section (Fixing Controller)
export async function getStaffSection(data: { ASMAY_Id: number; TTMC_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    const url = '/Fixing/getstaff_section';
    return await api.post<any>('timetable', url, data);
}

// Get Subject based on Staff (Fixing Controller)
export async function getSubjectStaff(data: { ASMAY_Id: number; TTMC_Id: number; ASMCL_Id: number; ASMS_Id: number; HRME_Id: number }) {
    const url = '/Fixing/getsubject_staff';
    return await api.post<any>('timetable', url, data);
}

// Save Bifurcation Constraints
export async function saveBifurcationConstraintsDetail(data: any) {
    const url = '/BifurcationFacade/AddOrUpdateBifurcationConstraints';
    return await api.post<any>('timetable', url, data);
}

// Get Details for Edit
export async function getBifurcationConstraintsEditDetails(id: number) {
    const url = `/BifurcationFacade/GetEditDetails/${id}`;
    return await api.get<any>('timetable', url);
}

// Delete/Deactivate Record
export async function deleteBifurcationConstraintsDetail(id: number) {
    const url = `/Bifurcation/deletedetails/${id}`;
    return await api.delete<any>('timetable', url); // Assuming DeleteURI uses delete method, though legacy might be GET/POST. Check apiService if unsure. usually DeleteURI is DELETE.
}

// Get View Records for Popup
export async function getBifurcationConstraintsViewRecords(id: number) {
    const url = `/Bifurcation/getalldetailsviewrecords/${id}`;
    return await api.get<any>('timetable', url);
}

export async function getBifurcationViewData(id: number) {
    const url = `/BifurcationFacade/BifurcationViewData/${id}`;
    return await api.get<any>('timetable', url);
}

export async function getStaffDropdownBifurcationConstraints() {
    const url = '/BifurcationFacade/GetStaffDropDownData';
    return await api.get<StaffDropdownDataBifurcation[]>('timetable', url);
}

export async function getSectioDropdownBifurcationConstraints() {
    const url = '/BifurcationFacade/GetSectionDropDownData';
    return await api.get<SectionDropdownDataBifurcation[]>('timetable', url);
}

export async function getSubjectDropdownBifurcationConstraints() {
    const url = '/BifurcationFacade/GetSubjectDropDownData';
    return await api.get<SubjectDropdownData[]>('timetable', url);
}

//toggle-button
export async function toggleBifurcationConstraintsStatus(id: number) {
    const url = `/BifurcationFacade/BifurcationConstraintsActivateDeactivate/${id}`;
    return await api.put<any>('timetable', url);
}
