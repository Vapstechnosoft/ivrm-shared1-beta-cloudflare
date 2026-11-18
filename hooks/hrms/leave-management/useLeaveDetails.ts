'use client';

import { addLeaveCredit, getOnloadGridLeaveCredit } from '@/server/hrms/leave-management/transactions/leave-details';
import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const LEAVE_DETAILS_QUERY_KEYS = {
    GRID: 'leave-details-grid'
};

export const useLeaveDetailsGrid = (params?: ApiSearchparams) => {
    return useQuery({
        queryKey: [LEAVE_DETAILS_QUERY_KEYS.GRID, params], // Include params in queryKey
        queryFn: async () => {
            const response = await getOnloadGridLeaveCredit(params);
            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch leave credit list');
            }
            return response;
        }
    });
};

export const useSaveLeaveDetails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const response = await addLeaveCredit(payload);
            if (!response.success) {
                throw new Error(response.message || 'Failed to save leave credit');
            }
            return response;
        },
        onSuccess: (response) => {
            toast.success(response.message || 'Leave credit saved successfully');
            queryClient.invalidateQueries({ queryKey: [LEAVE_DETAILS_QUERY_KEYS.GRID] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });
};
