'use server';

import { api } from '@/lib/apiService';
import type {
    AcademicYear,
    Class,
    SaveStaffPeriodTransferPayload,
    Section,
    StaffPeriodTransferMasters,
    StaffPeriodTransferReportData,
    Subject
} from '@/types/timetable/Transaction/staffperiodtransfer';
import { revalidatePath } from 'next/cache';

export async function getAcademicYearData() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('TimeTableCommon', url);
    return await api.get<AcademicYear[]>('timetable', url);
}

export async function getClassData() {
    const url = '/TimeTableCommon/GetClassData';
    console.info('TimeTableCommon', url);
    return await api.get<Class[]>('timetable', url);
}

export async function getFromStaffDetails() {
    const url = '/StaffPeriodTransformFacade/GetFromStaffDetails';
    console.info('StaffPeriodTransformFacade', url);
    return await api.get<any[]>('timetable', url);
}

export async function getSubjectDetails() {
    const url = '/TimeTableCommon/subject-details';
    console.info('TimeTableCommon', url);
    return await api.get<Subject[]>('timetable', url);
}

export async function getStaffPeriodTransferMasters(): Promise<StaffPeriodTransferMasters> {
    const [years, classes, staff, subjects] = await Promise.all([
        getAcademicYearData(),
        getClassData(),
        getFromStaffDetails(),
        getSubjectDetails()
    ]);

    const staffData = staff.data || [];
    const mappedStaff = staffData
        .map((s: any) => ({
            hrmE_Id: s.hrmE_Id || s.HRME_Id,
            staffNamelst: s.staffNamelst || (s.firstName ? `${s.firstName} ${s.middleName || ''} ${s.lastName || ''}`.trim() : '') || ''
        }))
        .filter((s: any) => s.staffNamelst !== '');

    return {
        years: years.data || [],
        sections: [],
        classes: classes.data || [],
        staff: mappedStaff,
        subjects: subjects.data || []
    };
}

export async function getStaffPeriodTransferReport(payload: {
    asmaY_Id: number | string;
    hrmE_Id: number | string;
}) {
    const url = '/StaffPeriodTransformFacade/getrpt';
    console.info('StaffPeriodTransformFacade', url, payload);
    const requestData = {
        asmaY_Id: Number(payload.asmaY_Id),
        hrmE_Id: Number(payload.hrmE_Id)
    };
    return await api.post<StaffPeriodTransferReportData>('timetable', url, requestData);
}

export async function saveStaffPeriodTransfer(payload: SaveStaffPeriodTransferPayload | any) {
    const url = '/StaffPeriodTransformFacade/savedetailreplacement';
    console.info('StaffPeriodTransformFacade', url, payload);
    const response = await api.post<any>('timetable', url, payload);
    revalidatePath('/timetable/transactions/staffperiodtransfer');
    return response;
}

export async function getStaffPeriodDetails(payload: any) {
    const { asmaY_Id, hrmE_Id, asmcL_Id, asms_Id, ismS_Id } = payload;
    const url = `/StaffPeriodTransferFacade/GetPeriodDetails/${asmaY_Id}/${hrmE_Id}/${asmcL_Id}/${asms_Id}/${ismS_Id || 0}`;
    console.info('StaffPeriodTransferFacade', url);
    return await api.get<any>('timetable', url);
}

export async function getSectionsByClass(asmcL_Id: number) {
    const url = '/TimeTableCommon/section-details';
    console.info('TimeTableCommon', url);
    return await api.get<Section[]>('timetable', url);
}

export async function deleteStaffPeriodTransfer(payload: any) {
    const url = '/StaffPeriodTransformFacade/DeleteTransfer';
    console.info('StaffPeriodTransformFacade', url);
    const response = await api.post<any>('timetable', url, payload);
    revalidatePath('/timetable/transactions/staffperiodtransfer');
    return response;
}




