'use client';

import {
    getNdaPhotoApprovalList,
    getNdaPhotoInitialData,
    saveNdaPhotoApproval
} from '@/server/admission/preadmission/masters/nda_student_photo_approval';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const ndaPhotoKeys = {
    all: ['nda-photo-approval'] as const,
    initial: (type: string) => [...ndaPhotoKeys.all, 'initial', type] as const,
    list: (params: any) => [...ndaPhotoKeys.all, 'list', params] as const
};

/**
 * Hook to fetch initial data for NDA Student Photo Approval
 */
export function useNdaPhotoInitialData(type: 'Student' | 'Staff') {
    return useQuery({
        queryKey: ndaPhotoKeys.initial(type),
        queryFn: () => getNdaPhotoInitialData({ dup: type }),
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

/**
 * Hook to fetch photo approval list
 */
export function useNdaPhotoApprovalList() {
    return useMutation({
        mutationFn: (data: {
            dup: string;
            ASMAY_Id?: number;
            ASMCL_Id?: number;
            ASMS_Id?: number;
        }) => getNdaPhotoApprovalList(data)
    });
}

/**
 * Hook to save photo approval details
 */
export function useNdaPhotoSave() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { selectedImageslist: any[]; dup: string }) => saveNdaPhotoApproval(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ndaPhotoKeys.all });
        }
    });
}
