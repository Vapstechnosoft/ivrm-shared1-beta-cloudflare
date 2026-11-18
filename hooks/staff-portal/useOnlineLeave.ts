'use client';

import { getMasterLeave } from '@/server/hrms/leave-management/masters/master-leave';
import { applyLeave, cancelLeave, getInitialLeaveData, getLeaveHistory } from '@/server/staff-portal/online-leave';
import type { ILeaveApplicationRequest } from '@/types/staff-portal/online-leave';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export function useOnlineLeave() {
    const queryClient = useQueryClient();

    // 1. Queries
    const { data: initialData, isLoading: isInitLoading } = useQuery({
        queryKey: ['online-leave-initial'],
        queryFn: () => getInitialLeaveData()
    });

    const { data: masterLeaveData, isLoading: isMasterLoading } = useQuery({
        queryKey: ['master-leave-list'],
        queryFn: () => getMasterLeave()
    });

    const { data: historyData, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['online-leave-history'],
        queryFn: () => getLeaveHistory()
    });

    // 2. Mutations
    const applyMutation = useMutation({
        mutationFn: (payload: ILeaveApplicationRequest) => applyLeave(payload),
        onSuccess: (res: any) => {
            if (res.success) {
                toast.success(res.message || 'Leave applied successfully');
                queryClient.invalidateQueries({ queryKey: ['online-leave-history'] });
                queryClient.invalidateQueries({ queryKey: ['online-leave-initial'] });
            } else {
                toast.error(res.message || 'Failed to apply leave');
            }
        },
        onError: (err: any) => toast.error(err.message || 'An error occurred while applying leave')
    });

    const cancelMutation = useMutation({
        mutationFn: (id: number) => cancelLeave(id),
        onSuccess: (res: any) => {
            if (res.success) {
                toast.success(res.message || 'Leave cancelled successfully');
                queryClient.invalidateQueries({ queryKey: ['online-leave-history'] });
                queryClient.invalidateQueries({ queryKey: ['online-leave-initial'] });
            } else {
                toast.error(res.message || 'Failed to cancel leave');
            }
        },
        onError: (err: any) => toast.error(err.message || 'An error occurred while cancelling leave')
    });

    // 3. States for Integrated Leave Card (copied from admin logic)
    const [selectedLeave, setSelectedLeave] = useState<any>(null);
    const [selectedFromDate, setSelectedFromDate] = useState<Date | undefined>(undefined);
    const [selectedToDate, setSelectedToDate] = useState<Date | undefined>(undefined);
    const [isHalfDay, setIsHalfDay] = useState<boolean>(false);

    // Filtered History Data
    const effectiveHistory = useMemo(() => {
        if (!historyData) return [];
        if (Array.isArray(historyData)) return historyData;
        if ((historyData as any).employeeLeaveDetails) return (historyData as any).employeeLeaveDetails;
        return [];
    }, [historyData]);

    // Combined Data for Grid 1 (Balance + Latest History)
    const combinedBalanceData = useMemo(() => {
        const balances = initialData?.employeeLeaveDetails || (Array.isArray(initialData) ? initialData : []);
        if (!balances || !Array.isArray(balances)) return [];

        return balances.map((balance: any) => {
            // Find the most recent history record for this leave type
            const latestHistory = effectiveHistory
                ?.filter((h: any) => h.hrmL_Id === balance.hrmL_Id)
                .sort((a: any, b: any) => new Date(b.hrelaP_FromDate).getTime() - new Date(a.hrelaP_FromDate).getTime())[0];

            return {
                ...balance,
                latestFromDate: latestHistory?.hrelaP_FromDate || null,
                latestToDate: latestHistory?.hrelaP_ToDate || null,
                latestTotDays: latestHistory?.hreltD_TotDays || null
            };
        });
    }, [initialData, effectiveHistory]);

    // Calculate current selection total days for form
    const currentTotalDays = useMemo(() => {
        if (selectedFromDate && selectedToDate) {
            const days = differenceInDays(selectedToDate, selectedFromDate) + 1;
            return isHalfDay ? Math.max(0, days - 0.5) : days;
        }
        return undefined;
    }, [selectedFromDate, selectedToDate, isHalfDay]);

    return {
        initialData,
        masterLeaveData,
        historyData: effectiveHistory,
        combinedBalanceData,
        isLoading: isInitLoading || isHistoryLoading || isMasterLoading,
        applyMutation,
        cancelMutation,
        // Card States
        selectedLeave,
        setSelectedLeave,
        selectedFromDate,
        setSelectedFromDate,
        selectedToDate,
        setSelectedToDate,
        isHalfDay,
        setIsHalfDay,
        currentTotalDays
    };
}
