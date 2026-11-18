'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/ClgSectionAllotment';

// Initial Load Data: GET /api/ClgSectionAllotment/GetDropDownList
export async function getClgSectionAllotmentInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/GetDropDownList`);
    } catch (error) {
        console.error('[Server] getClgSectionAllotmentInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

// Student Details & Academic Courses on Year Change: POST /api/ClgSectionAllotment/getStudentdetailsByYear?ASMAY_Id=...
export async function getClgSectionAllotmentStudentDetailsByYear(data: { ASMAY_Id: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/getStudentdetailsByYear?ASMAY_Id=${asmayId}`);
}

// Alias for backwards compatibility
export const getClgSectionAllotmentAcademicCourses = getClgSectionAllotmentStudentDetailsByYear;

// Branch List on Course Change: POST /api/ClgSectionAllotment/Getbranch?ASMAY_Id=...&AMCO_Id=...
export async function getClgSectionAllotmentBranches(data: { ASMAY_Id: number; AMCO_Id: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amcoId = Number(data.AMCO_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/Getbranch?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}`);
}

// Semesters on Branch Change: POST /api/ClgSectionAllotment/Get_semister?ASMAY_Id=...&AMCO_Id=...&AMB_Id=...
export async function getClgSectionAllotmentSemesters(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amcoId = Number(data.AMCO_Id || 0);
    const ambId = Number(data.AMB_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/Get_semister?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}`);
}

// Students List by Year, Course, Branch, Semester, Section: POST /api/ClgSectionAllotment/GetstudentdetailsbyYearandclass?...
export async function getClgSectionAllotmentStudents(data: any) {
    const asmayId = Number(data.ASMAY_Id ?? data.asmaY_Id ?? 0);
    const amcoId = Number(data.AMCO_Id ?? data.amcO_Id ?? 0);
    const ambId = Number(data.AMB_Id ?? data.amB_Id ?? 0);
    const amseId = Number(data.AMSE_Id ?? data.amsE_Id ?? 0);
    const acmsId = Number(data.ACMS_Id ?? data.acmS_Id ?? 0);
    const type = data.SectionAllotmentType ?? data.sectionAllotmentType ?? '';

    return await api.post<any>(
        'college',
        `${BASE_URL}/GetstudentdetailsbyYearandclass?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}&ACMS_Id=${acmsId}&SectionAllotmentType=${type}`
    );
}

// Save Section Allotment (New, Change, Delete, Promotion, YearLoss): POST /api/ClgSectionAllotment/saveSctionAllotment
export async function saveClgSectionAllotment(data: any) {
    return await api.post<any>('college', `${BASE_URL}/saveSctionAllotment`, data);
}

// Promotion: Course list on Year change: POST /api/ClgSectionAllotment/GetPromocourse?ASMAY_Id=...
export async function getClgSectionAllotmentPromoCourses(data: { ASMAY_Id: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/GetPromocourse?ASMAY_Id=${asmayId}`);
}

// Promotion: Branch list on Course change: POST /api/ClgSectionAllotment/GetPromobranch?ASMAY_Id=...&AMCO_Id=...
export async function getClgSectionAllotmentPromoBranches(data: { AMCO_Id: number; ASMAY_Id: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amcoId = Number(data.AMCO_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/GetPromobranch?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}`);
}

// Promotion: Sem list on Branch change: POST /api/ClgSectionAllotment/GetPromosem?ASMAY_Id=...&AMCO_Id=...&AMB_Id=...
export async function getClgSectionAllotmentPromoSemesters(data: { AMB_Id: number; ASMAY_Id: number; AMCO_Id: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amcoId = Number(data.AMCO_Id || 0);
    const ambId = Number(data.AMB_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/GetPromosem?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}`);
}

// Promotion: Target Semester on Sem change: POST /api/ClgSectionAllotment/promsemonchange?ASMAY_Id=...&AMSE_Id=...
export async function getClgSectionAllotmentPromoSemOnChange(data: { ASMAY_Id: number; AMSE_Id: number; AMCO_Id?: number; AMB_Id?: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amseId = Number(data.AMSE_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/promsemonchange?ASMAY_Id=${asmayId}&AMSE_Id=${amseId}`);
}

// Year Loss: Courses on Year change: POST /api/ClgSectionAllotment/OnChangeyearlossAcademic?ASMAY_Id=...
export async function getClgSectionAllotmentYearLossAcademic(data: { ASMAY_Id: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/OnChangeyearlossAcademic?ASMAY_Id=${asmayId}`);
}

// Year Loss: Branches on Course change: POST /api/ClgSectionAllotment/Getyearlossbranch?ASMAY_Id=...&AMCO_Id=...
export async function getClgSectionAllotmentYearLossBranch(data: { ASMAY_Id: number; AMCO_Id: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amcoId = Number(data.AMCO_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/Getyearlossbranch?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}`);
}

// Year Loss: Semesters on Branch change: POST /api/ClgSectionAllotment/Getyearlosssem?ASMAY_Id=...&AMCO_Id=...&AMB_Id=...
export async function getClgSectionAllotmentYearLossSem(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amcoId = Number(data.AMCO_Id || 0);
    const ambId = Number(data.AMB_Id || 0);
    return await api.post<any>('college', `${BASE_URL}/Getyearlosssem?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}`);
}

// Year Loss: Students list: POST /api/ClgSectionAllotment/GetStudentListByYear_yearloss1?...
export async function getClgSectionAllotmentYearLossStudents(data: any) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amcoId = Number(data.AMCO_Id || 0);
    const ambId = Number(data.AMB_Id || 0);
    const amseId = Number(data.AMSE_Id || 0);
    const acmsId = Number(data.ACMS_Id || 0);
    return await api.post<any>(
        'college',
        `${BASE_URL}/GetStudentListByYear_yearloss1?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}&ACMS_Id=${acmsId}`
    );
}

// Update Roll No: Get Students: POST /api/ClgSectionAllotment/GetStudentListByURN?...
export async function getClgSectionAllotmentStudentsByURN(data: any) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amcoId = Number(data.AMCO_Id || 0);
    const ambId = Number(data.AMB_Id || 0);
    const amseId = Number(data.AMSE_Id || 0);
    const acmsId = Number(data.ACMS_Id || 0);
    return await api.post<any>(
        'college',
        `${BASE_URL}/GetStudentListByURN?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}&ACMS_Id=${acmsId}`
    );
}

// Update Roll No: Save Roll Numbers: POST /api/ClgSectionAllotment/GetStudentListByURNsave
export async function saveClgSectionAllotmentRollNo(data: any) {
    return await api.post<any>('college', `${BASE_URL}/GetStudentListByURNsave`, data);
}

// Change Course & Branch: Get Students: POST /api/ClgSectionAllotment/GetStudentCBS?...
export async function getClgSectionAllotmentCBSStudents(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
}) {
    const asmayId = Number(data.ASMAY_Id || 0);
    const amcoId = Number(data.AMCO_Id || 0);
    const ambId = Number(data.AMB_Id || 0);
    const amseId = Number(data.AMSE_Id || 0);
    return await api.post<any>(
        'college',
        `${BASE_URL}/GetStudentCBS?ASMAY_Id=${asmayId}&AMCO_Id=${amcoId}&AMB_Id=${ambId}&AMSE_Id=${amseId}`
    );
}

// Change Course & Branch: Save Course & Branch Transfer: POST /api/ClgSectionAllotment/saveCourdebranch_CBS
export async function saveClgSectionAllotmentCourseBranch(data: any) {
    return await api.post<any>('college', `${BASE_URL}/saveCourdebranch_CBS`, data);
}
