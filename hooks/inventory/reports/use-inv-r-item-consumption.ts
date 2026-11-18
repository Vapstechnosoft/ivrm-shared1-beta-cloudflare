import { getInvRItemConsumptionLoadData, getInvRItemConsumptionReport } from '@/server/inventory/reports/inv-r-item-consumption';
import type { IInvRItemConsumptionPayload } from '@/types/inventory/reports/inv-r-item-consumption';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useInvRItemConsumptionLoadData = (optionflag: string | undefined) => {
    return useQuery({
        queryKey: ['invRItemConsumptionLoadData', optionflag],
        queryFn: () => getInvRItemConsumptionLoadData(optionflag!),
        enabled: !!optionflag && optionflag !== 'All'
    });
};

export const useInvRItemConsumptionReport = () => {
    return useMutation({
        mutationFn: (payload: IInvRItemConsumptionPayload) => getInvRItemConsumptionReport(payload),
        onSuccess: (data) => {
            if (data.success) {
                toast.success('Report generated successfully');
            } else {
                toast.error(data.message || 'Failed to generate report');
            }
        },
        onError: (error) => {
            toast.error('An error occurred while generating the report');
            console.error(error);
        }
    });
};

export const useInvRItemConsumptionReportQuery = (payload: IInvRItemConsumptionPayload | null, searchParams: any) => {
    return useQuery({
        queryKey: ['invRItemConsumptionReport', payload, searchParams],
        queryFn: () => {
            if (!payload) return { success: true, data: [], total: 0, message: '', page: 1, page_size: 10 };
            const enhancedPayload = payload
                ? {
                      ...payload,
                      search_query: searchParams.search_query || '',
                      search_column: searchParams.search_column || 'All'
                  }
                : null;
            return getInvRItemConsumptionReport(enhancedPayload, searchParams);
        },
        enabled: !!payload
    });
};
