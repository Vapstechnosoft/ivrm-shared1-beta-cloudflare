'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getSophiaStudentTCCancelLoadData,
    getSophiaStudentTCCancelOnChangeYear,
    getSophiaStudentTCCancelOnStudentChange,
    saveSophiaStudentTCCancelDetails
} from '@/server/admission/preadmission/transactions/sophia_student_tc_cancel';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSophiaStudentTCCancelLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TRANSACTIONS, 'sophia_student_tc_cancel', 'load_data'],
        queryFn: () => getSophiaStudentTCCancelLoadData(),
        staleTime: 0
    });
};

export const useSophiaStudentTCCancelOnChangeYear = () => {
    return useMutation({
        mutationFn: (asmayId: number) => getSophiaStudentTCCancelOnChangeYear(asmayId)
    });
};

export const useSophiaStudentTCCancelOnStudentChange = () => {
    return useMutation({
        mutationFn: (data: { asmayId: number; amstId: number }) => getSophiaStudentTCCancelOnStudentChange(data.asmayId, data.amstId)
    });
};

export const useSophiaStudentTCCancelSave = () => {
    return useMutation({
        mutationFn: (data: { AMST_Id: number; ASMAY_Id: number; TC_CancelReason: string }) => saveSophiaStudentTCCancelDetails(data)
    });
};
