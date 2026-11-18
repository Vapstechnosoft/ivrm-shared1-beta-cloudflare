import {
    getNdaSiblingDetails,
    getNdaStudentProfileDetails,
    saveNdaProfileUpdateRequest,
    uploadNdaProfilePic
} from '@/server/admission/preadmission/reports/nda_student_profile_update';
import { useMutation, useQuery } from '@tanstack/react-query';

export const ndaKeys = {
    all: ['nda-student-profile-update'] as const,
    details: () => [...ndaKeys.all, 'details'] as const
};

/**
 * Hook to fetch student and configuration details
 */
export const useNdaStudentProfileDetails = (updateFlag = false) => {
    return useQuery({
        queryKey: [...ndaKeys.details(), updateFlag],
        queryFn: () => (updateFlag ? getNdaSiblingDetails(updateFlag) : getNdaStudentProfileDetails()),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

/**
 * Mutation to fetch data for a specific sibling
 */
export const useNdaSiblingDetails = () => {
    return useMutation({
        mutationFn: getNdaSiblingDetails
    });
};

/**
 * Mutation to submit the profile update request
 */
export const useNdaSaveRequest = () => {
    return useMutation({
        mutationFn: saveNdaProfileUpdateRequest
    });
};

/**
 * Mutation to upload profile pictures
 */
export const useNdaUploadProfilePic = () => {
    return useMutation({
        mutationFn: uploadNdaProfilePic
    });
};
