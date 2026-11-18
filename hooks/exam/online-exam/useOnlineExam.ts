import { getMasterQuestionLoadData } from '@/server/exam/online-exam/master-question';
import { getOnlineExamConfigLoadData } from '@/server/exam/online-exam/online-exam-config';
import { getOnlineExamReportLoadData } from '@/server/exam/online-exam/reports';
import { useQuery } from '@tanstack/react-query';

export const useOnlineExamQuestion = (searchParams?: any) => {
    return useQuery({
        queryKey: ['onlineExamQuestion', searchParams],
        queryFn: () => getMasterQuestionLoadData(searchParams)
    });
};

export const useOnlineExamConfig = (searchParams?: any) => {
    return useQuery({
        queryKey: ['onlineExamConfig', searchParams],
        queryFn: () => getOnlineExamConfigLoadData(searchParams)
    });
};

export const useOnlineExamReports = (searchParams?: any) => {
    return useQuery({
        queryKey: ['onlineExamReports', searchParams],
        queryFn: () => getOnlineExamReportLoadData(searchParams)
    });
};

