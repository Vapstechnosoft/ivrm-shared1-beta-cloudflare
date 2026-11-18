'use client';

import {
    getAbsentStaff,
    getAcademicYearData,
    getAllDetailsViewRecords2,
    getDeputationNewDetails,
    getDeputationNewMasters,
    getFreeStaffDets,
    getPeriodAlloted,
    getViewAbsent,
    getViewDeputation,
    getViewRecordsPopup9,
    saveDeputationNewDetails
} from '@/server/timetable/transactions/deputationnew';
import type {
    IAbsentStaffPayload,
    IFreeStaffPayload,
    IPeriodAllotedPayload,
    ISaveDeputationNewPayload,
    IViewAbsentPayload,
    IViewDeputationPayload,
    IViewRecords2Payload,
    IViewRecordsPopup9Payload
} from '@/types/timetable/Transaction/deputationnew';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 1. Initial details / masters (using TimeTableCommon endpoints)
export const useDeputationNewMasters = () => {
    return useQuery({
        queryKey: ['deputationNewMasters'],
        queryFn: () => getDeputationNewMasters()
    });
};

export const useDeputationNewDetails = () => {
    return useQuery({
        queryKey: ['deputationNewDetails'],
        queryFn: () => getDeputationNewDetails()
    });
};

// 2. Academic Year
export const useDeputationNewAcademicYears = () => {
    return useQuery({
        queryKey: ['timetableAcademicYearData'],
        queryFn: () => getAcademicYearData()
    });
};

// 3. Absent Staff query
export const useDeputationNewAbsentStaff = (payload: IAbsentStaffPayload, enabled = true) => {
    return useQuery({
        queryKey: ['deputationNewAbsentStaff', payload.ASMAY_Id, payload.TTSD_Date, payload.absflag],
        queryFn: () => getAbsentStaff(payload),
        enabled: enabled && !!payload.ASMAY_Id && !!payload.TTSD_Date
    });
};

// 4. Period Alloted query
export const useDeputationNewPeriodAlloted = (payload: IPeriodAllotedPayload, enabled = true) => {
    return useQuery({
        queryKey: ['deputationNewPeriodAlloted', payload.ASMAY_Id, payload.TTMD_Id, payload.HRME_Id, payload.TTSD_Date],
        queryFn: () => getPeriodAlloted(payload),
        enabled: enabled && !!payload.ASMAY_Id && !!payload.TTMD_Id && !!payload.HRME_Id && !!payload.TTSD_Date
    });
};

// 5. Free Staff details query
export const useDeputationNewFreeStaff = (payload: IFreeStaffPayload, enabled = true) => {
    return useQuery({
        queryKey: ['deputationNewFreeStaff', payload.ASMAY_Id, payload.TTMD_Id, payload.TTMP_Id, payload.HRME_Id, payload.TTSD_Date],
        queryFn: () => getFreeStaffDets(payload),
        enabled: enabled && !!payload.ASMAY_Id && !!payload.TTMD_Id && !!payload.TTMP_Id && !!payload.HRME_Id && !!payload.TTSD_Date
    });
};

// 6. View Records 2 (Day/Period matrix for substitute staff)
export const useDeputationNewViewRecords2 = (payload: IViewRecords2Payload, enabled = true) => {
    return useQuery({
        queryKey: ['deputationNewViewRecords2', payload.ASMAY_Id, payload.HRME_Id],
        queryFn: () => getAllDetailsViewRecords2(payload),
        enabled: enabled && !!payload.ASMAY_Id && !!payload.HRME_Id
    });
};

// 7. View Records Popup 9
export const useDeputationNewViewRecordsPopup9 = (payload: IViewRecordsPopup9Payload, enabled = true) => {
    return useQuery({
        queryKey: ['deputationNewViewRecordsPopup9', payload.ASMAY_Id, payload.HRME_Id, payload.TTMD_Id],
        queryFn: () => getViewRecordsPopup9(payload),
        enabled: enabled && !!payload.ASMAY_Id && !!payload.HRME_Id && !!payload.TTMD_Id
    });
};

// 8. View Deputation History
export const useDeputationNewViewDeputation = (payload: IViewDeputationPayload, enabled = true) => {
    return useQuery({
        queryKey: ['deputationNewViewDeputation', payload.ASMAY_Id, payload.HRME_Id, payload.FLAG, payload.TTSD_Date],
        queryFn: () => getViewDeputation(payload),
        enabled: enabled && !!payload.ASMAY_Id && !!payload.HRME_Id && !!payload.FLAG
    });
};

// 9. View Absent History
export const useDeputationNewViewAbsent = (payload: IViewAbsentPayload, enabled = true) => {
    return useQuery({
        queryKey: ['deputationNewViewAbsent', payload.ASMAY_Id, payload.HRME_Id, payload.FLAG, payload.TTSD_Date],
        queryFn: () => getViewAbsent(payload),
        enabled: enabled && !!payload.ASMAY_Id && !!payload.HRME_Id && !!payload.FLAG
    });
};

// 10. Save Deputation Mutation
export const useSaveDeputationNew = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ISaveDeputationNewPayload) => saveDeputationNewDetails(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deputationNewPeriodAlloted'] });
        }
    });
};
