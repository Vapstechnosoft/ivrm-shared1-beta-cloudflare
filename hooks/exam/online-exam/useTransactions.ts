import { ONLINE_EXAM_QUERY_KEYS } from '@/constants/query-keys';
import { getAnswerPaperInitialData, getStudentAnswerSheet } from '@/server/exam/online-exam/transactions/answer-paper-correction';
import { getPublishInitialData } from '@/server/exam/online-exam/transactions/publish-to-student';
import { useQuery } from '@tanstack/react-query';

// Hook for Answer Paper Correction Initial Load
export const useAnswerPaperInitialData = () => {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.ANSWER_PAPER_CORRECTION],
        queryFn: getAnswerPaperInitialData
    });
};

// Hook for Student Answer Sheet (Individual Evaluation)
export const useStudentAnswerSheet = (amsT_Id: number | null, lpmoeeX_Id: number | null) => {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.ANSWER_PAPER_STUDENT_ANSWERS, amsT_Id, lpmoeeX_Id],
        queryFn: () => (amsT_Id && lpmoeeX_Id ? getStudentAnswerSheet({ AMST_Id: amsT_Id, LPMOEEX_Id: lpmoeeX_Id }) : null),
        enabled: Boolean(amsT_Id && lpmoeeX_Id)
    });
};

// Hook for Publish to Student Initial Load
export const usePublishInitialData = () => {
    return useQuery({
        queryKey: [ONLINE_EXAM_QUERY_KEYS.PUBLISH_TO_STUDENT],
        queryFn: getPublishInitialData
    });
};

