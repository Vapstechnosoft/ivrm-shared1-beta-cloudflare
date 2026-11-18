import { ONLINE_EXAM_QUERY_KEYS } from '@/constants/query-keys';
import {
    deleteMasterComplexity,
    getMasterComplexityFullData,
    saveMasterComplexity,
    toggleMasterComplexity
} from '@/server/exam/online-exam/masters/master-complexity';
import {
    deleteMasterQuestion,
    getMasterQuestionInitialData,
    getQuestionOptions,
    saveMasterQuestion,
    toggleMasterQuestion
} from '@/server/exam/online-exam/masters/master-question';
import {
    getMasterQuestionCollegeInitialData,
    getQuestionOptionsCollege
} from '@/server/exam/online-exam/masters/master-question-college';
import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- Master Question (School) ---
export const useMasterQuestion = (searchParams?: ApiSearchparams, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION, searchParams ?? {}],
        queryFn: async () => {
            const res = await getMasterQuestionInitialData(searchParams);
            return res ?? null;
        },
        enabled: options?.enabled ?? true
    });
};

export const useSaveMasterQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => saveMasterQuestion(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION] })
    });
};

export const useToggleMasterQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (questionId: number) => toggleMasterQuestion(questionId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION] })
    });
};

export const useDeleteMasterQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (questionId: number) => deleteMasterQuestion(questionId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION] })
    });
};

export const useQuestionOptions = (questionId: number | null) => {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_OPTIONS, questionId],
        queryFn: async () => {
            if (!questionId) return null;
            const res = await getQuestionOptions(questionId);
            return res ?? null;
        },
        enabled: Boolean(questionId)
    });
};

// --- Master Question (College) ---
export const useMasterQuestionCollege = (searchParams?: ApiSearchparams) => {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_COLLEGE, searchParams ?? {}],
        queryFn: async () => {
            const res = await getMasterQuestionCollegeInitialData(searchParams);
            return res ?? null;
        }
    });
};

export const useQuestionOptionsCollege = (questionId: number | null) => {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.MASTER_QUESTION_OPTIONS, questionId],
        queryFn: async () => {
            if (!questionId) return null;
            const res = await getQuestionOptionsCollege(questionId);
            return res ?? null;
        },
        enabled: Boolean(questionId)
    });
};

// --- Master Complexity ---
export const useMasterComplexity = (searchParams?: ApiSearchparams, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['MASTER_COMPLEXITY', searchParams ?? {}],
        queryFn: async () => {
            const res = await getMasterComplexityFullData(searchParams);
            return res ?? null;
        },
        enabled: options?.enabled ?? true
    });
};


export const useSaveMasterComplexity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => saveMasterComplexity(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['MASTER_COMPLEXITY'] })
    });
};

export const useToggleMasterComplexity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (complexityId: number) => toggleMasterComplexity(complexityId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['MASTER_COMPLEXITY'] })
    });
};

export const useDeleteMasterComplexity = () => {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async (complexityId: number) => {
            const res = await fetch('/api/exam/master-complexity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle', LPMCOMP_Id: complexityId, MI_Id: 30 })
            });
            const json = await res.json();
            await queryClient.invalidateQueries({
                queryKey: ['MASTER_COMPLEXITY']
            });
            return json;
        }
    };
}
