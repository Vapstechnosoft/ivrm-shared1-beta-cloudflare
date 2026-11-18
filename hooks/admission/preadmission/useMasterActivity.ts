'use client';

import type { IMasterActivity } from '@/schemas/admission/preadmission/master_activity';
import {
    addOrUpdateMasterActivity,
    deleteMasterActivityData,
    getMasterActivitiesDetails,
    getSelectedMasterActivityRow
} from '@/server/admission/preadmission/masters/master_activity';
import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEYS = {
    MASTER_ACTIVITY_DETAILS: 'master_activity_details',
    MASTER_ACTIVITY_ROW: 'master_activity_row'
};

/**
 * Hook for Master Activity Details
 */
export const useMasterActivityDetails = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [QUERY_KEYS.MASTER_ACTIVITY_DETAILS, searchParams ?? {}],
        queryFn: () => getMasterActivitiesDetails(searchParams),
        staleTime: 0
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MASTER_ACTIVITY_DETAILS] });
    };

    return {
        ...query,
        refetchAll
    };
};

/**
 * Hook for fetching a single activity for edit
 */
export const useSelectedMasterActivityRow = (id: number, enabled = false) => {
    return useQuery({
        queryKey: [QUERY_KEYS.MASTER_ACTIVITY_ROW, id],
        queryFn: () => getSelectedMasterActivityRow(id),
        enabled: enabled && !!id
    });
};

/**
 * Hook for saving/updating activity
 */
export const useSaveMasterActivity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IMasterActivity) => addOrUpdateMasterActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MASTER_ACTIVITY_DETAILS] });
        }
    });
};

/**
 * Hook for deleting activity
 */
export const useDeleteMasterActivity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteMasterActivityData(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MASTER_ACTIVITY_DETAILS] });
        }
    });
};
