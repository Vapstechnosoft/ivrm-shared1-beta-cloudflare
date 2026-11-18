'use server';

import { api } from '@/lib/apiService';
import type {
    IAbsentStaffPayload,
    IAcademicYearItem,
    ICategoryItem,
    IClassItem,
    IDayItem,
    IDeputationNewInitialData,
    IFreeStaffPayload,
    IPeriodAllotedPayload,
    ISaveDeputationNewPayload,
    IStaffItem,
    IViewAbsentPayload,
    IViewDeputationPayload,
    IViewRecords2Payload,
    IViewRecordsPopup9Payload
} from '@/types/timetable/Transaction/deputationnew';
import { revalidatePath } from 'next/cache';

// 1. Common Timetable Masters APIs (TimeTableCommon)
export async function getAcademicYearData() {
    const url = '/TimeTableCommon/GetAcademicYearData';
    console.info('TimeTableCommon', url);
    return await api.get<IAcademicYearItem[]>('timetable', url);
}

export async function getCategoryDetails() {
    const url = '/TimeTableCommon/GetCategoryDetails';
    console.info('TimeTableCommon', url);
    return await api.get<ICategoryItem[]>('timetable', url);
}

export async function getClassData() {
    const url = '/TimeTableCommon/GetClassData';
    console.info('TimeTableCommon', url);
    return await api.get<IClassItem[]>('timetable', url);
}

export async function getStaffDetails() {
    const url = '/TimeTableCommon/GetStaffDetails';
    console.info('TimeTableCommon', url);
    return await api.get<IStaffItem[]>('timetable', url);
}

export async function getDayDetails() {
    const url = '/TimeTableCommon/GetDayDetails';
    console.info('TimeTableCommon', url);
    return await api.get<IDayItem[]>('timetable', url);
}

// Load all masters together using TimeTableCommon endpoints in parallel
export async function getDeputationNewMasters(): Promise<{
    data: IDeputationNewInitialData;
    success: boolean;
    message: string;
}> {
    try {
        const [yearsRes, daysRes, staffRes, categoriesRes, classesRes] = await Promise.all([
            getAcademicYearData(),
            getDayDetails(),
            getStaffDetails(),
            getCategoryDetails(),
            getClassData()
        ]);

        return {
            success: true,
            message: 'Masters loaded successfully',
            data: {
                acayear: yearsRes.data || [],
                daylist: daysRes.data || [],
                stafflist: staffRes.data || [],
                categorylist: categoriesRes.data || [],
                classlist: classesRes.data || []
            }
        };
    } catch (error: any) {
        console.error('Error fetching timetable masters:', error);
        return {
            success: false,
            message: error?.message || 'Failed to fetch timetable masters',
            data: {
                acayear: [],
                daylist: [],
                stafflist: [],
                categorylist: [],
                classlist: []
            }
        };
    }
}

// Kept for backward compatibility, delegates to getDeputationNewMasters
export async function getDeputationNewDetails() {
    return await getDeputationNewMasters();
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
export async function saveDeputationNewDetails(payload: ISaveDeputationNewPayload) {
    const url = '/DeputationNewFacade/savedetails';
    console.info('DeputationNewFacade', url, payload);
    const response = await api.post<any>('timetable', url, payload);
    revalidatePath('/timetable/transactions/deputationnew');
    return response;
}
