import { getBookArrivalReportData, getBookArrivalReportInitialData } from '@/server/library/reports/book-arrival-report';
import type { IBookArrivalReportRequest } from '@/types/library/reports/book-arrival-report';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useBookArrivalReportInitialData = () => {
    return useQuery({
        queryKey: ['book-arrival-report-initial'],
        queryFn: () => getBookArrivalReportInitialData(),
        refetchOnWindowFocus: false
    });
};

export const useBookArrivalReportSearch = () => {
    return useMutation({
        mutationFn: (data: IBookArrivalReportRequest) => getBookArrivalReportData(data),
        onError: (error: any) => {
            console.error('Error fetching report data:', error);
            const msg = typeof error === 'string' ? error : error?.message || 'Failed to fetch report data';
            if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('Authentication')) {
                toast.error('Session expired or unauthorized. Please re-login.');
            } else {
                toast.error(msg);
            }
        }
    });
};
