import { getStudentAgeReport, getStudentAgeReportLoadData } from '@/server/sports/reports/student-age-calculation';
import type { IReportRequest } from '@/types/sports/reports/student-age-calculation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useStudentAgeCalculationReport = (payload?: IReportRequest, searchParams?: any) => {
    const queryClient = useQueryClient();

    const initialData = useQuery({
        queryKey: ['studentAgeCalculationReportInitial'],
        queryFn: () => getStudentAgeReportLoadData()
    });

    const reportQuery = useQuery({
        queryKey: ['student-age-report', payload, searchParams],
        queryFn: () => getStudentAgeReport(payload!, searchParams),
        enabled: !!payload
    });

    const generateReport = useMutation({
        mutationFn: ({ data, searchParams }: { data: IReportRequest; searchParams?: any }) => getStudentAgeReport(data, searchParams)
    });

    return {
        initialData,
        reportQuery,
        generateReport,
        refetchReport: () => queryClient.invalidateQueries({ queryKey: ['student-age-report'] })
    };
};
