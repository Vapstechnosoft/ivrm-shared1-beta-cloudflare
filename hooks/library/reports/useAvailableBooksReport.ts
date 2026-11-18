import { getAvailableBooksReportData, getAvailableBooksReportInitialData } from '@/server/library/reports/available-books-report';
import type { IAvailableBooksReportRequest } from '@/types/library/reports/available-books-report';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAvailableBooksReportInitialData = () => {
    return useQuery({
        queryKey: ['available-books-report-initial'],
        queryFn: () => getAvailableBooksReportInitialData(),
        refetchOnWindowFocus: false
    });
};

export const useAvailableBooksReportSearch = () => {
    return useMutation({
        mutationFn: (data: IAvailableBooksReportRequest) => getAvailableBooksReportData(data),
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
