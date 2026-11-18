import { getInvVendorDetails, getInvVendorPaymentReport } from '@/server/inventory/reports/inv-r-vendor-payment';
import type { IInvVendorPaymentDetailsPayload, IInvVendorPaymentReportPayload } from '@/types/inventory/reports/inv-r-vendor-payment';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useInvVendorPaymentReport = () => {
    return useMutation({
        mutationFn: (payload: IInvVendorPaymentReportPayload) => getInvVendorPaymentReport(payload),
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

export const useInvVendorDetails = () => {
    return useMutation({
        mutationFn: (payload: IInvVendorPaymentDetailsPayload) => getInvVendorDetails(payload),
        onError: (error) => {
            toast.error('An error occurred while fetching details');
            console.error(error);
        }
    });
};

export const useInvVendorPaymentReportQuery = (payload: IInvVendorPaymentReportPayload | null, searchParams: any) => {
    return useQuery({
        queryKey: ['invVendorPaymentReport', payload, searchParams],
        queryFn: () => {
            if (!payload) return { success: true, data: [], total: 0, message: '', page: 1, page_size: 10 };
            // Inject search parameters into payload for backend compatibility
            const enhancedPayload = {
                ...payload,
                search_query: searchParams.search_query || '',
                search_columns: searchParams.search_columns || ''
            };
            return getInvVendorPaymentReport(enhancedPayload, searchParams);
        },
        enabled: !!payload
    });
};
