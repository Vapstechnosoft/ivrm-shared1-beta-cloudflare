import {
    getEmployeeLeavesByEmployeeId,
    getEmployeesDropDown,
    getLeaveDetailsGridByEmployeeId,
    saveAdminEmployeeLeaveApplication
} from '@/server/hrms/leave-management/transaction/online-admin-leave';
import type { SaveAdminEmployeeLeaveApplicationRequest } from '@/types/hrms/leave-management/online-admin-leave';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ONLINE_ADMIN_LEAVE_KEYS = {
    EMPLOYEES_LIST: 'online-admin-leave-employees-list',
    LEAVE_HISTORY: (hrmeId: number) => ['online-admin-leave-history', hrmeId],
    LEAVE_BALANCE: (hrmeId: number) => ['online-admin-leave-balance', hrmeId]
};

/**
 * Hook to get employees dropdown
 */
export function useEmployeesDropDown() {
    return useQuery({
        queryKey: [ONLINE_ADMIN_LEAVE_KEYS.EMPLOYEES_LIST],
        queryFn: async () => {
            const response = await getEmployeesDropDown();
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        }
    });
}

/**
 * Hook to get leave history by employee id
 */
export function useLeaveHistoryByEmployeeId(hrmeId: number | null) {
    return useQuery({
        queryKey: hrmeId ? ONLINE_ADMIN_LEAVE_KEYS.LEAVE_HISTORY(hrmeId) : [],
        queryFn: async () => {
            console.log(hrmeId);
            if (!hrmeId) return [];
            // Delay to bypass Next.js soft navigation AbortError (nuqs state update)
            await new Promise((resolve) => setTimeout(resolve, 150));
            const response = await getLeaveDetailsGridByEmployeeId(hrmeId);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        },
        enabled: !!hrmeId
    });
}

/**
 * Hook to get leave balance by employee id
 */
export function useLeaveBalanceByEmployeeId(hrmeId: number | null) {
    return useQuery({
        queryKey: hrmeId ? ONLINE_ADMIN_LEAVE_KEYS.LEAVE_BALANCE(hrmeId) : [],
        queryFn: async () => {
            if (!hrmeId) return null;
            // Delay to bypass Next.js soft navigation AbortError (nuqs state update)
            await new Promise((resolve) => setTimeout(resolve, 150));
            const response = await getEmployeeLeavesByEmployeeId(hrmeId);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        },
        enabled: !!hrmeId
    });
}

export function useSaveAdminEmployeeLeaveApplication() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: SaveAdminEmployeeLeaveApplicationRequest) => {
            console.log('🔵 [MUTATION_FN] Executing saveAdminEmployeeLeaveApplication with data:', data);
            const response = await saveAdminEmployeeLeaveApplication(data);
            console.log('🔵 [MUTATION_FN] Response received:', response);
            if (!response.success) {
                console.warn('🔵 [MUTATION_FN] Response success is false, throwing error:', response.message);
                throw new Error(response.message);
            }
            return response;
        },
        onSuccess: (data, variables) => {
            console.log('✅ [MUTATION_ON_SUCCESS] Success callback triggered! Showing toast for:', data.message);
            toast.success(data.message);
            // Invalidate queries for the specific employee
            queryClient.invalidateQueries({ queryKey: ONLINE_ADMIN_LEAVE_KEYS.LEAVE_HISTORY(variables.HRME_Id) });
            queryClient.invalidateQueries({ queryKey: ONLINE_ADMIN_LEAVE_KEYS.LEAVE_BALANCE(variables.HRME_Id) });
        },
        onError: (error: Error) => {
            console.error('❌ [MUTATION_ON_ERROR] Error callback triggered! Showing toast for error:', error.message);
            toast.error(error.message);
        }
    });
}
