'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getSophiaStudentTCApprovalDetails,
    getSophiaStudentTCApprovalLoadData,
    saveSophiaStudentTCApprovalData,
    updateSophiaStudentTCApprovalIDs
} from '@/server/admission/preadmission/transactions/sophia_student_tc_approval';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSophiaStudentTCApprovalLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TRANSACTIONS, 'sophia_student_tc_approval', 'load_data'],
        queryFn: () => getSophiaStudentTCApprovalLoadData({ Flag: '' }),
        staleTime: 0
    });
};

export const useSophiaStudentTCApprovalDetails = (asmayId: number) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TRANSACTIONS, 'sophia_student_tc_approval', 'details', asmayId],
        queryFn: () => getSophiaStudentTCApprovalDetails({ ASMAY_Id: asmayId }),
        staleTime: 0
    });
};

export const useSophiaStudentTCApprovalSave = () => {
    return useMutation({
        mutationFn: (data: { selectedTCDATAlist: any[] }) => saveSophiaStudentTCApprovalData(data)
    });
};

export const useSophiaStudentTCApprovalUpdateIDs = () => {
    return useMutation({
        mutationFn: (data: { studentdata: any[] }) => updateSophiaStudentTCApprovalIDs(data)
    });
};
