'use client';

import type { ApiResponse } from '@/lib/apiService';
import {
    deleteInteraction,
    fetchThread,
    getInitialInteractions,
    getRecipientsByRole,
    getSectionsForInteraction,
    getStudentsForInteraction,
    loadFeedbackQuestions,
    markMessageAsRead,
    saveFeedback,
    saveInteraction,
    saveInteractionReply
} from '@/server/staff-portal/interactions';
import type {
    IFeedbackOption,
    IFeedbackQuestion,
    IInteractionsInitialData,
    ISaveInteractionRequest,
    ISaveReplyRequest,
    IThreadResponse
} from '@/types/staff-portal/interactions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useInteractions = () => {
    const queryClient = useQueryClient();

    const initialDataQuery = useQuery<ApiResponse<IInteractionsInitialData>>({
        queryKey: ['interactions-initial'],
        queryFn: () => getInitialInteractions()
    });

    const getRecipientsMutation = useMutation<
        ApiResponse<{ getdetails: any[]; configflag: any[] }>,
        Error,
        { roleflg: string; userflag: string; asmay_Id: number }
    >({
        mutationFn: (params) => getRecipientsByRole(params.roleflg, params.userflag, params.asmay_Id)
    });

    const getSectionsMutation = useMutation<
        ApiResponse<{ sectionList: any[] }>,
        Error,
        { asmcL_Id: number; asmaY_Id: number; roleflg: string }
    >({
        mutationFn: (params) => getSectionsForInteraction(params.asmcL_Id, params.asmaY_Id, params.roleflg)
    });

    const getStudentsMutation = useMutation<ApiResponse<{ get_student: any[] }>, Error, { asmcL_Id: number; asmS_Id: number }>({
        mutationFn: (params) => getStudentsForInteraction(params.asmcL_Id, params.asmS_Id)
    });

    const saveMutation = useMutation<ApiResponse<{ returnval: boolean }>, Error, ISaveInteractionRequest>({
        mutationFn: (data) => saveInteraction(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interactions-initial'] })
    });

    const replyMutation = useMutation<ApiResponse<{ returnval: boolean }>, Error, ISaveReplyRequest>({
        mutationFn: (data) => saveInteractionReply(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interactions-initial'] })
    });

    const deleteMutation = useMutation<ApiResponse<{ returnval: boolean }>, Error, { ISMINT_Id: number; ISTINT_Id: number }>({
        mutationFn: (data) => deleteInteraction(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interactions-initial'] })
    });

    const fetchThreadMutation = useMutation<ApiResponse<IThreadResponse>, Error, number>({
        mutationFn: (ISMINT_Id) => fetchThread(ISMINT_Id)
    });

    const markAsReadMutation = useMutation<ApiResponse<{ returnval: boolean }>, Error, number>({
        mutationFn: (ISTINT_Id) => markMessageAsRead(ISTINT_Id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interactions-initial'] })
    });

    const feedbackQuery = useQuery<ApiResponse<{ feedbackquestion: IFeedbackQuestion[]; feedbackoption: IFeedbackOption[] }>>({
        queryKey: ['interactions-feedback'],
        queryFn: () => loadFeedbackQuestions('Interaction')
    });

    const saveFeedbackMutation = useMutation<
        ApiResponse<{ returnval: boolean }>,
        Error,
        { savemodulefeedback: any[]; Flag: string; HRME_Id: number }
    >({
        mutationFn: (data) => saveFeedback(data)
    });

    return {
        initialData: initialDataQuery.data?.data,
        isLoadingInitial: initialDataQuery.isLoading,
        getRecipients: getRecipientsMutation,
        getSections: getSectionsMutation,
        getStudents: getStudentsMutation,
        save: saveMutation,
        reply: replyMutation,
        deleteMsg: deleteMutation,
        fetchThread: fetchThreadMutation,
        markAsRead: markAsReadMutation,
        feedback: feedbackQuery.data?.data,
        saveFeedback: saveFeedbackMutation,
        refresh: () => initialDataQuery.refetch()
    };
};
