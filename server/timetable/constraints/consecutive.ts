'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IConsecutiveConstraintDetails } from '@/types/timetable/constraints/bifurcationconstraints';
import type { consecutive } from '@/types/timetable/constraints/consecutive';

export async function getConsecutiveConstraintsDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'asmAYYear,ttmCCategoryName,ttmDDayName,ttmPPeriodName,staffName,className,sectionName,subjectName,ttfConsecutive_Id,ttfConsecutive_ActiveFlag'
    );
    const url = `/TT_ConsecutiveFacade/ConsecutiveConstraintsGridData?${urlParams}`;
    console.info('ConsecutiveFacade', url);
    return await api.get<IConsecutiveConstraintDetails[]>('timetable', url);
}

// Save Consecutive Constraints
export async function saveConsecutiveConstraintsDetail(data: any) {
    const url = '/TT_ConsecutiveFacade/saveConsecutivedetail';
    const response = await api.post<any>('timetable', url, data);
    return response;
}

// Get Details for Edit
export async function getConsecutiveConstraintsEditDetails(id: number) {
    const url = `/TT_ConsecutiveFacade/GetEditDataConsecutive/${id}`;
    const response = await api.get<any>('timetable', url);
    return response.data;
}

// Delete Record
export async function deleteConsecutiveConstraints(id: number) {
    const url = `/TT_ConsecutiveFacade/deletepages/${id}`;
    const response = await api.delete<any>('timetable', url);
    return response.data;
}

// Deactivate/Activate Record
export async function deactivateConsecutiveConstraints(data: any) {
    // const url = '/TT_ConsecutiveFacade/deactivate';
    const url = `/TT_ConsecutiveFacade/ConsecutiveActivateDeactivate/${data.ttC_Id}`;

    const response = await api.put<consecutive>('timetable', url, data);
    return response;
}

//api calls

//academic Year
export async function getAcademicYearDropDownMasterDayClasswise() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    const response = await api.get<consecutive[]>('timetable', url);
    return response.data;
}

//Category
export async function getCategoryDropDownMasterDayClasswise() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    const response = await api.get<consecutive[]>('timetable', url);
    return response.data;
}

//class
export async function getTransactionClassDropdown(asmay_id: number, ttmc_id: number) {
    const url = `/MasterDayFacade/ClassDataByAcademicyrandCategory/${asmay_id}/${ttmc_id}`;
    return await api.get<consecutive[]>('timetable', url);
}

//section
export async function getSectionDetails() {
    const url = '/TimeTableCommon/section-details';
    const response = await api.get<consecutive[]>('timetable', url);
    return response.data;
}

//staff
export async function getStaffDropDownMasterDayClasswise(data: { ASMAY_Id: number; TTMC_Id: number; ASMCL_Id: number; ASMS_Id: number }) {
    const url = '/FixingFacade/getstaffandmaxvaluedata';
    const response = await api.post<any>('timetable', url, data);
    return response.data;
}

//subject
export async function getSubjectDropDownMasterDayClasswise(data: {
    ASMAY_Id: number;
    TTMC_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    HRME_Id: number;
}) {
    const url = '/FixingFacade/subject_by_staff';
    const response = await api.post<any>('timetable', url, data);
    return response.data;
}
