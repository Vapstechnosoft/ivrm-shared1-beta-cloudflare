import type { ISportsYearEndReportRequest } from '@/app/(root)/Sports/Reports/SportsYearEndReport/types';
import {
    getSportsYearEndReport,
    getSportsYearEndReportClasses,
    getSportsYearEndReportLoadData,
    getSportsYearEndReportSections
} from '@/server/sports/reports/year-end-report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSportsYearEndReport = () => {
    // Initial Data Load (Years)
    const initialData = useQuery({
        queryKey: ['sportsYearEndReport', 'loadData'],
        queryFn: () => getSportsYearEndReportLoadData(),
        staleTime: Number.POSITIVE_INFINITY
    });

    // Fetch Classes on Year Change
    const classMutation = useMutation({
        mutationFn: ({ asmaY_Id }: { asmaY_Id: number }) => getSportsYearEndReportClasses(asmaY_Id)
    });

    // Fetch Sections on Class Change
    const sectionMutation = useMutation({
        mutationFn: ({ asmaY_Id, asmcL_Id }: { asmaY_Id: number; asmcL_Id: number }) => getSportsYearEndReportSections(asmaY_Id, asmcL_Id)
    });

    // Generate Report
    const reportMutation = useMutation({
        mutationFn: (data: ISportsYearEndReportRequest) => getSportsYearEndReport(data)
    });

    return {
        initialData,
        classMutation,
        sectionMutation,
        reportMutation
    };
};
