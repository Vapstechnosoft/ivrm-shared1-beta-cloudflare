'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    deleteMasterQuestionBank,
    getMasterQuestionBankLoadData,
    getMasterQuestionBankSubjects,
    saveMasterQuestionBank,
    searchMasterQuestionBankDocument
} from '@/server/admission/preadmission/transactions/master_question_bank';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterQuestionBankLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.TRANSACTIONS, 'master_question_bank', 'load_data'],
        queryFn: () => getMasterQuestionBankLoadData({ pageid: 10 }),
        staleTime: 0
    });
};

export const useMasterQuestionBankSubjects = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number }) => getMasterQuestionBankSubjects(data)
    });
};

export const useMasterQuestionBankSave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => saveMasterQuestionBank(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.TRANSACTIONS, 'master_question_bank', 'load_data']
            });
        }
    });
};

export const useMasterQuestionBankDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => deleteMasterQuestionBank(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.TRANSACTIONS, 'master_question_bank', 'load_data']
            });
        }
    });
};

export const useMasterQuestionBankSearch = () => {
    return useMutation({
        mutationFn: (data: { searchparameter: string }) => searchMasterQuestionBankDocument(data)
    });
};
