'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getSophiaStudentTCApplyLoadData,
    getSophiaStudentTCApplyOnChangeClass,
    getSophiaStudentTCApplyStudentList,
    getSophiaStudentTCTCPdf,
    getSophiaStudentTCViewStatus,
    saveSophiaStudentTCApply
} from '@/server/admission/preadmission/transactions/sophia_student_tc_apply';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSophiaStudentTCApplyLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TRANSACTIONS, 'sophia_student_tc_apply', 'load_data'],
        queryFn: () => getSophiaStudentTCApplyLoadData({ TCData: 1 }),
        staleTime: 0
    });
};

export const useSophiaStudentTCApplyOnChangeClass = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number }) => getSophiaStudentTCApplyOnChangeClass(data)
    });
};

export const useSophiaStudentTCApplyStudentList = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) => getSophiaStudentTCApplyStudentList(data)
    });
};

export const useSophiaStudentTCApplySave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { studentTCdata: any[]; tcflagexists: string; transnumconfigsettings: any }) => saveSophiaStudentTCApply(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADMISSION_QUERY_KEYS.TRANSACTIONS, 'sophia_student_tc_apply', 'load_data'] });
        }
    });
};

export const useSophiaStudentTCApplyTCPdf = () => {
    return useMutation({
        mutationFn: (data: { AMST_Id: number }) => getSophiaStudentTCTCPdf(data)
    });
};

export const useSophiaStudentTCApplyViewStatus = () => {
    return useMutation({
        mutationFn: (data: { AMST_Id: number; ASMAY_Id: number }) => getSophiaStudentTCViewStatus(data)
    });
};
