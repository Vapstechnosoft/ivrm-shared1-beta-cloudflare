import * as server from '@/server/admission/preadmission/reports/sophia_tc_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useTCInitialData = () => {
    return useQuery({
        queryKey: ['tc-report-initial-data'],
        queryFn: () => server.getTCInitialData()
    });
};

export const useTCYearChange = () => {
    return useMutation({
        mutationFn: (asmayId: number) => server.onTCYearChange({ ASMAY_Id: asmayId })
    });
};

export const useTCClassChange = () => {
    return useMutation({
        mutationFn: (payload: { asmayId: number; asmclId: number }) =>
            server.onTCClassChange({ ASMAY_Id: payload.asmayId, ASMCL_Id: payload.asmclId })
    });
};

export const useTCSectionChange = () => {
    return useMutation({
        mutationFn: (payload: { asmayId: number; asmclId: number; asmsId: number }) =>
            server.onTCSectionChange({ ASMAY_Id: payload.asmayId, ASMCL_Id: payload.asmclId, ASMS_Id: payload.asmsId })
    });
};

export const useStudentNameRegNo = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getStudentNameRegNo(payload)
    });
};

export const useStudentNameChange = () => {
    return useMutation({
        mutationFn: (payload: { asmayId: number; amstId: number }) =>
            server.onStudentNameChange({ ASMAY_Id: payload.asmayId, AMST_Id: payload.amstId })
    });
};

export const useTCGetDetailsRecord = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getTCDetailsRecord(payload)
    });
};

export const useTCGetReport = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getTCReportDetails(payload)
    });
};
