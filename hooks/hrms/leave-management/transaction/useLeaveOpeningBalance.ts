'use client';

import {
    addOrUpdateEmpLeaveOpeningBalance,
    deleteEmpLeaveOpeningBalance,
    getEmployeeLeaveOpeningBalanceGrid
} from '@/server/hrms/leave-management/transaction/leave-opening-balance';
import { getLeaveOB } from '@/server/hrms/master-dropdown';
import type {
    LeaveOpeningBalanceSearch,
    SaveLeaveOpeningBalancePayload
} from '@/types/hrms/leave-management/transaction/leave-opening-balance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const QUERY_KEY = 'leaveOpeningBalance';

export function useLeaveOpeningBalanceGrid(searchParams?: LeaveOpeningBalanceSearch) {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [QUERY_KEY, searchParams],
            queryFn: async () => {
                const response = await getEmployeeLeaveOpeningBalanceGrid(searchParams);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch leave opening balance grid');
                }
                return response;
            }
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEY]
            });
        }
    };
}

export function useSaveLeaveOpeningBalance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: SaveLeaveOpeningBalancePayload) => {
            const response = await addOrUpdateEmpLeaveOpeningBalance(payload);
            if (!response.success) {
                throw new Error(response.message || 'Failed to save leave opening balance');
            }
            return response;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Saved successfully');
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY]
            });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save');
        }
    });
}

export function useDeleteLeaveOpeningBalance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await deleteEmpLeaveOpeningBalance(id);
            if (!response.success) {
                throw new Error(response.message || 'Failed to delete leave opening balance');
            }
            return response;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Deleted successfully');
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY]
            });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete');
        }
    });
}

export function useGetLeaveOB() {
    return useQuery({
        queryKey: [QUERY_KEY, 'leaveOB'],
        queryFn: async () => {
            const response = await getLeaveOB();
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch leave OB data');
            }
            return response;
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}
