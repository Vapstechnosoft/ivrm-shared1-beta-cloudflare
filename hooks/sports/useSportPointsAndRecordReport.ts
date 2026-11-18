import {
    getClassesHousesEvents,
    getPointsRecordReport,
    getPointsRecordReportLoadData,
    getSections
} from '@/server/sports/reports/points-record-report';
import type { SportPointsAndRecordReportFormSchema } from '@/types/sports/reports/points-record-report';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useSportPointsAndRecordReport = () => {
    const loadData = useQuery({
        queryKey: ['pointsRecordReportValues'],
        queryFn: getPointsRecordReportLoadData
    });

    const classHouseEventMutation = useMutation({
        mutationFn: ({ asmaY_Id }: { asmaY_Id: number }) => getClassesHousesEvents(asmaY_Id),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to fetch cascading data');
        }
    });

    const sectionMutation = useMutation({
        mutationFn: ({ asmaY_Id, asmcL_Id }: { asmaY_Id: number; asmcL_Id: number }) => getSections(asmaY_Id, asmcL_Id),
        onError: (error: any) => {
            toast.error(error.message || 'Failed to fetch sections');
        }
    });

    const generateReport = useMutation({
        mutationFn: async (data: SportPointsAndRecordReportFormSchema) => {
            const response = await getPointsRecordReport(data as any);
            return response;
        }
    });

    return {
        loadData,
        classHouseEventMutation,
        sectionMutation,
        generateReport
    };
};
