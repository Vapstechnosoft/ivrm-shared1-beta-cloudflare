'use client';

import {
    createSchedule,
    deleteMedia,
    deleteSchedule,
    getDisplays,
    getLibrary,
    getSchedule,
    requestScreenshot,
    uploadAndSchedule
} from '@/server/digital-signage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const SIGNAGE_QUERY_KEYS = {
    LIBRARY: 'signage:library',
    SCHEDULE: 'signage:schedule',
    DISPLAYS: 'signage:displays'
} as const;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useSignage() {
    const queryClient = useQueryClient();

    // -------------------------------------------------------------------------
    // LIBRARY
    // -------------------------------------------------------------------------
    const useLibrary = (page = 1, displayId?: number) =>
        useQuery({
            queryKey: [SIGNAGE_QUERY_KEYS.LIBRARY, page, displayId],
            queryFn: () => getLibrary(page, 10, displayId),
            placeholderData: (prev) => prev
        });

    const deleteMediaMutation = useMutation({
        mutationFn: ({ mediaId, forceDelete }: { mediaId: number; forceDelete?: boolean }) => deleteMedia(mediaId, forceDelete),
        onSuccess: (res, variables) => {
            if (res.success) {
                toast.success('Media deleted successfully');
                queryClient.invalidateQueries({ queryKey: [SIGNAGE_QUERY_KEYS.LIBRARY] });
            } else {
                const isInUseError = res.message?.includes('422') || res.message?.includes('in use');
                if (!(isInUseError && !variables.forceDelete)) {
                    toast.error(res.message || 'Failed to delete media');
                }
            }
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to delete media')
    });

    // -------------------------------------------------------------------------
    // SCHEDULE
    // -------------------------------------------------------------------------
    const useSchedule = (page = 1, displayId?: number) =>
        useQuery({
            queryKey: [SIGNAGE_QUERY_KEYS.SCHEDULE, page, displayId],
            queryFn: () => getSchedule(page, 10, displayId),
            placeholderData: (prev) => prev
        });

    const createScheduleMutation = useMutation({
        mutationFn: ({
            mediaId,
            displayId,
            startDate,
            endDate
        }: {
            mediaId: number;
            displayId: number;
            startDate: string;
            endDate: string;
        }) => createSchedule(mediaId, displayId, startDate, endDate),
        onSuccess: (res) => {
            if (res.success) {
                toast.success('Schedule created successfully');
                queryClient.invalidateQueries({ queryKey: [SIGNAGE_QUERY_KEYS.SCHEDULE] });
            } else {
                toast.error(res.message || 'Failed to create schedule');
            }
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to create schedule')
    });

    const deleteScheduleMutation = useMutation({
        mutationFn: (eventId: number) => deleteSchedule(eventId),
        onSuccess: (res) => {
            if (res.success) {
                toast.success('Schedule event deleted successfully');
                queryClient.invalidateQueries({ queryKey: [SIGNAGE_QUERY_KEYS.SCHEDULE] });
            } else {
                toast.error(res.message || 'Failed to delete schedule');
            }
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to delete schedule')
    });

    // -------------------------------------------------------------------------
    // DISPLAYS
    // -------------------------------------------------------------------------
    const useDisplays = (page = 1) =>
        useQuery({
            queryKey: [SIGNAGE_QUERY_KEYS.DISPLAYS, page],
            queryFn: () => getDisplays(page),
            placeholderData: (prev) => prev
        });

    const requestScreenshotMutation = useMutation({
        mutationFn: (displayId: number) => requestScreenshot(displayId),
        onSuccess: (res) => {
            if (res.success) {
                toast.success('Screenshot request submitted');
            } else {
                toast.error(res.message || 'Failed to request screenshot');
            }
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to request screenshot')
    });

    // -------------------------------------------------------------------------
    // UPLOAD + SCHEDULE  (combined – sends FormData with file + scheduling info)
    // -------------------------------------------------------------------------
    const uploadMutation = useMutation({
        mutationFn: (formData: FormData) => uploadAndSchedule(formData),
        onSuccess: (res) => {
            if (res.success) {
                toast.success('Media uploaded and scheduled successfully');
                queryClient.invalidateQueries({ queryKey: [SIGNAGE_QUERY_KEYS.LIBRARY] });
                queryClient.invalidateQueries({ queryKey: [SIGNAGE_QUERY_KEYS.SCHEDULE] });
            } else {
                toast.error(res.message || 'Failed to upload and schedule');
            }
        },
        onError: (err: any) => toast.error(err?.message || 'Failed to upload and schedule')
    });

    // -------------------------------------------------------------------------
    return {
        // queries  (call inside component: const { data } = useSignage().useLibrary(1))
        useLibrary,
        useSchedule,
        useDisplays,

        // mutations
        deleteMedia: deleteMediaMutation,
        createSchedule: createScheduleMutation,
        deleteSchedule: deleteScheduleMutation,
        requestScreenshot: requestScreenshotMutation,
        uploadAndSchedule: uploadMutation
    };
}
