'use client';

import {
    getEmployeePunchDetails,
    saveEmployeePunch,
    togglePunchDetail
} from '@/server/hrms/attendance-management/masters/front-office-add-logs';
import type { IEmployeePunchSaveRequest } from '@/types/hrms/attendance-management/masters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook for Front Office Add Logs
 */
export function useSaveEmployeePunch() {
    return useMutation({
        mutationFn: (data: IEmployeePunchSaveRequest) => saveEmployeePunch(data),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || 'Punch logs saved successfully');
            } else {
                toast.error(data.message || 'Failed to save punch logs');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to save punch logs');
        }
    });
}

/**
 * Hook to get employee punch details
 */
export function useEmployeePunchDetails(foep_punchDate: string, hrme_id: number) {
    return useQuery({
        queryKey: ['employeePunchDetails', foep_punchDate, hrme_id],
        queryFn: () => getEmployeePunchDetails(foep_punchDate, hrme_id),
        enabled: !!foep_punchDate && !!hrme_id
    });
}

/**
 * Hook to toggle (delete) employee punch detail
 */
export function useTogglePunchDetail() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (foepd_id: number) => togglePunchDetail(foepd_id),
        onSuccess: (data) => {
            if (data.success) {
                toast.success(data.message || 'Punch detail deleted successfully');
                queryClient.invalidateQueries({ queryKey: ['employeePunchDetails'] });
            } else {
                toast.error(data.message || 'Failed to delete punch detail');
            }
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete punch detail');
        }
    });
}
