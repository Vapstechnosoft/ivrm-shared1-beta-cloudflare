import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import { getCollegeUsernameCreationInitialData, getCollegeUsernameCreationOnYearChange, getCollegeUsernameCreationOnCourseChange, getCollegeUsernameCreationOnBranchChange, getCollegeUsernameCreationOnSemChange, getCollegeUsernameCreationStudentDetails, saveCollegeUsernameCreation, getCollegeUsernameCreationStudentUsername, sendCollegeUsernameCreationSMS } from '@/server/college/CollegeAdmission/Standarad/college-username-creation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useCollegeUsernameCreation = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_USERNAME_CREATION],
            queryFn: async () => getCollegeUsernameCreationInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_USERNAME_CREATION]
            });
        }
    };
};

export const useCollegeUsernameCreationOnYearChange = () => {
    return useMutation({
        mutationFn: async (asmayId: number) => getCollegeUsernameCreationOnYearChange(asmayId),
    });
};

export const useCollegeUsernameCreationOnCourseChange = () => {
    return useMutation({
        mutationFn: async ({ asmayId, amcoId }: { asmayId: number; amcoId: number }) => 
            getCollegeUsernameCreationOnCourseChange(asmayId, amcoId),
    });
};

export const useCollegeUsernameCreationOnBranchChange = () => {
    return useMutation({
        mutationFn: async ({ asmayId, amcoId, ambId }: { asmayId: number; amcoId: number; ambId: number }) => 
            getCollegeUsernameCreationOnBranchChange(asmayId, amcoId, ambId),
    });
};

export const useCollegeUsernameCreationOnSemChange = () => {
    return useMutation({
        mutationFn: async ({ asmayId, amcoId, ambId, amseId }: { asmayId: number; amcoId: number; ambId: number; amseId: number }) => 
            getCollegeUsernameCreationOnSemChange(asmayId, amcoId, ambId, amseId),
    });
};

export const useCollegeUsernameCreationStudentDetails = () => {
    return useMutation({
        mutationFn: async ({ asmayId, amcoId, ambId, amseId, acmsId, studentType }: { asmayId: number; amcoId: number; ambId: number; amseId: number; acmsId: number; studentType: string }) => 
            getCollegeUsernameCreationStudentDetails(asmayId, amcoId, ambId, amseId, acmsId, studentType),
    });
};

export const useSaveCollegeUsernameCreation = () => {
    return useMutation({
        mutationFn: async (data: any) => saveCollegeUsernameCreation(data),
    });
};

export const useCollegeUsernameCreationStudentUsername = () => {
    return useMutation({
        mutationFn: async ({ asmayId, amcoId, ambId, amseId, acmsId, studentType }: { asmayId: number; amcoId: number; ambId: number; amseId: number; acmsId: number; studentType: string }) => 
            getCollegeUsernameCreationStudentUsername(asmayId, amcoId, ambId, amseId, acmsId, studentType),
    });
};

export const useSendCollegeUsernameCreationSMS = () => {
    return useMutation({
        mutationFn: async (data: any) => sendCollegeUsernameCreationSMS(data),
    });
};
