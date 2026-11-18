import * as server from '@/server/admission/preadmission/transactions/student_attendance_entry';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useStudentAttendanceInitialData = (portalType?: string) => {
    return useQuery({
        queryKey: ['student-attendance-initial-data', portalType],
        queryFn: () => server.getInitialData(portalType)
    });
};

export const useGetStudentData = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getStudentData(payload)
    });
};

export const useGetMonthClassHeld = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getMonthClassHeld(payload)
    });
};

export const useGetDateWiseAttendance = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getDateWiseAttendance(payload)
    });
};

export const useGetBatchList = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getBatchList(payload)
    });
};

export const useGetStdListPeriod = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getStdListPeriod(payload)
    });
};

export const useSaveAttendance = () => {
    return useMutation({
        mutationFn: (payload: any) => server.saveAttendance(payload)
    });
};

export const useViewAttendance = () => {
    return useMutation({
        mutationFn: (payload: any) => server.viewAttendanceDetailsStaffWise(payload)
    });
};

export const useDeleteAttendance = () => {
    return useMutation({
        mutationFn: (payload: any) => server.deleteAttendance(payload)
    });
};

export const useDeleteAttendanceRecordWise = () => {
    return useMutation({
        mutationFn: (payload: any) => server.deleteAttendanceRecordWise(payload)
    });
};
