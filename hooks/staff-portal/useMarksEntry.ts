'use client';

import {
    getInitialMarksEntryData,
    getMarksEntryClasses,
    getMarksEntryExams,
    getMarksEntrySections,
    getMarksEntrySubjects,
    saveMarksEntry,
    searchMarksEntry
} from '@/server/staff-portal/marks-entry';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useMarksEntry = () => {
    // Initial data
    const initialDataQuery = useQuery({
        queryKey: ['marks-entry-initial'],
        queryFn: () => getInitialMarksEntryData()
    });

    // Dependent dropdown mutations (using mutations for manual trigger on change)
    const getClassesMutation = useMutation({
        mutationFn: getMarksEntryClasses
    });

    const getSectionsMutation = useMutation({
        mutationFn: (params: { asmaY_Id: number; asmcL_Id: number }) => getMarksEntrySections(params.asmaY_Id, params.asmcL_Id)
    });

    const getExamsMutation = useMutation({
        mutationFn: (params: { asmaY_Id: number; asmcL_Id: number; asmS_Id: number }) =>
            getMarksEntryExams(params.asmaY_Id, params.asmcL_Id, params.asmS_Id)
    });

    const getSubjectsMutation = useMutation({
        mutationFn: (params: { asmaY_Id: number; asmcL_Id: number; asmS_Id: number; emE_Id: number }) =>
            getMarksEntrySubjects(params.asmaY_Id, params.asmcL_Id, params.asmS_Id, params.emE_Id)
    });

    // Search and Save
    const searchMutation = useMutation({
        mutationFn: searchMarksEntry
    });

    const saveMutation = useMutation({
        mutationFn: saveMarksEntry
    });

    return {
        initialData: initialDataQuery.data?.data,
        isLoadingInitial: initialDataQuery.isLoading,
        getClasses: getClassesMutation,
        getSections: getSectionsMutation,
        getExams: getExamsMutation,
        getSubjects: getSubjectsMutation,
        search: searchMutation,
        save: saveMutation
    };
};
