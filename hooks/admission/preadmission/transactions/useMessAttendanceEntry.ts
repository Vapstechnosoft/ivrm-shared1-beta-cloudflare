'use client';

import {
    attendanceDeleteRecordWise,
    deleteAttendance,
    getBatchList,
    getDatewiseAttMDM,
    getMessAttendanceLoadData,
    getMonthClassHeld,
    getStdListPeriod,
    getStudentData,
    getStudents,
    saveMessStudentAttendance,
    viewAttendanceDetailsStaffWise
} from '@/server/admission/preadmission/transactions/mess_attendance_entry';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useMessAttendanceLoadData = (portalType?: string) => {
    return useQuery({
        queryKey: ['mess-attendance-load', portalType],
        queryFn: () => getMessAttendanceLoadData(portalType)
    });
};

export const useGetStudentData = () => {
    return useMutation({
        mutationFn: (data: any) => getStudentData(data)
    });
};

export const useGetStudents = () => {
    return useMutation({
        mutationFn: (data: any) => getStudents(data)
    });
};

export const useGetMonthClassHeld = () => {
    return useMutation({
        mutationFn: (data: any) => getMonthClassHeld(data)
    });
};

export const useGetDatewiseAttMDM = () => {
    return useMutation({
        mutationFn: (data: any) => getDatewiseAttMDM(data)
    });
};

export const useGetBatchList = () => {
    return useMutation({
        mutationFn: (data: any) => getBatchList(data)
    });
};

export const useGetStdListPeriod = () => {
    return useMutation({
        mutationFn: (data: any) => getStdListPeriod(data)
    });
};

export const useViewAttendanceDetailsStaffWise = () => {
    return useMutation({
        mutationFn: (data: any) => viewAttendanceDetailsStaffWise(data)
    });
};

export const useSaveMessStudentAttendance = () => {
    return useMutation({
        mutationFn: (data: any) => saveMessStudentAttendance(data)
    });
};

export const useDeleteAttendance = () => {
    return useMutation({
        mutationFn: (data: any) => deleteAttendance(data)
    });
};

export const useAttendanceDeleteRecordWise = () => {
    return useMutation({
        mutationFn: (data: any) => attendanceDeleteRecordWise(data)
    });
};
