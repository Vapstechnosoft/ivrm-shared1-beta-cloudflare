import { getSportsYearEndReport, getSportsYearEndReportLoadData } from '@/server/sports/reports/year-end-report';
import type { YearEndReportFormSchema } from '@/types/sports/reports/year-end-report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useYearEndReport = () => {
    const loadData = useQuery({
        queryKey: ['yearEndReportValues'],
        queryFn: getSportsYearEndReportLoadData
    });

    const generateReport = useMutation({
        mutationFn: async (data: YearEndReportFormSchema) => {
            const response = await getSportsYearEndReport(data as any);
            return response;
        }
    });

    return {
        loadData,
        generateReport
    };
};
