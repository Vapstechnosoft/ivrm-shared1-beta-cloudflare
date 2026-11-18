'use server';

import { api } from '@/lib/apiService';
import type {
    IAbsentStaffPayload,
    IAcademicYearItem,
    IFreeStaffPayload,
    IPeriodAllotedPayload,
    ISaveDeputationPayload,
    IViewAbsentPayload,
    IViewDeputationPayload,
    IViewRecords2Payload,
    IViewRecordsPopup9Payload
} from '@/types/timetable/Transaction/deputation';
import { revalidatePath } from 'next/cache';

// Common Academic Year API
export async function getAcademicYearData() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('TimeTableCommon', url);
    return await api.get<IAcademicYearItem[]>('timetable', url);
}

// 1. GET /api/DeputationNewFacade/getdetails
export async function getDeputationDetails() {
    const url = '/DeputationNewFacade/getdetails';
    console.info('DeputationNewFacade', url);
    return await api.get<any>('timetable', url);
}

// 2. POST /api/DeputationNewFacade/getabsentstaff
export async function getAbsentStaff(payload: IAbsentStaffPayload) {
    const url = '/DeputationNewFacade/getabsentstaff';
    console.info('DeputationNewFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

// 3. POST /api/DeputationNewFacade/get_period_alloted
export async function getPeriodAlloted(payload: IPeriodAllotedPayload) {
    const url = '/DeputationNewFacade/get_period_alloted';
    console.info('DeputationNewFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

// 4. POST /api/DeputationNewFacade/get_free_stfdets
export async function getFreeStaffDets(payload: IFreeStaffPayload) {
    const url = '/DeputationNewFacade/get_free_stfdets';
    console.info('DeputationNewFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

// 5. POST /api/DeputationNewFacade/getalldetailsviewrecords2
export async function getAllDetailsViewRecords2(payload: IViewRecords2Payload) {
    const url = '/DeputationNewFacade/getalldetailsviewrecords2';
    console.info('DeputationNewFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

// 6. POST /api/DeputationNewFacade/viewrecordspopup9
export async function getViewRecordsPopup9(payload: IViewRecordsPopup9Payload) {
    const url = '/DeputationNewFacade/viewrecordspopup9';
    console.info('DeputationNewFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

// 7. POST /api/DeputationNewFacade/viewdeputation
export async function getViewDeputation(payload: IViewDeputationPayload) {
    const url = '/DeputationNewFacade/viewdeputation';
    console.info('DeputationNewFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

// 8. POST /api/DeputationNewFacade/viewabsent
export async function getViewAbsent(payload: IViewAbsentPayload) {
    const url = '/DeputationNewFacade/viewabsent';
    console.info('DeputationNewFacade', url, payload);
    return await api.post<any>('timetable', url, payload);
}

// 9. POST /api/DeputationNewFacade/savedetails
export async function saveDeputationDetails(payload: ISaveDeputationPayload) {
    const url = '/DeputationNewFacade/savedetails';
    console.info('DeputationNewFacade', url, payload);
    const response = await api.post<any>('timetable', url, payload);
    revalidatePath('/timetable/transactions/deputation');
    return response;
}
