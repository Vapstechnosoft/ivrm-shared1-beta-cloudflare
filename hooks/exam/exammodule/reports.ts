import { getExamData, getExamReportLoadData, getStudentExamDetails, getSubjects } from '@/server/exam/exam-module/reports/exam-report';
import { useQuery } from '@tanstack/react-query';

const EXAM_REPORT_KEYS = {
    LOAD_DATA: 'examReportLoadData',
    EXAM_DATA: 'examReportExamData',
    SUBJECTS: 'examReportSubjects',
    STUDENT_DETAILS: 'examReportStudentDetails'
};

export const useExamReportLoadData = (payload: { Type: string; AMST_Id: number; EME_Id: number; ismS_Id: number }, enabled = true) => {
    return useQuery({
        queryKey: [EXAM_REPORT_KEYS.LOAD_DATA, payload],
        queryFn: () => getExamReportLoadData(payload.Type, payload.AMST_Id, payload.EME_Id, payload.ismS_Id),
        enabled: enabled && !!payload.Type && !!payload.AMST_Id && !!payload.EME_Id && !!payload.ismS_Id,
        staleTime: 0
    });
};
export const useExamData = (payload: { Type: string; ASMAY_Id: number; AMST_Id?: number }, enabled = true) => {
    return useQuery({
        queryKey: [EXAM_REPORT_KEYS.EXAM_DATA, payload],
        queryFn: () => getExamData(payload),
        enabled: enabled && !!payload.ASMAY_Id,
        staleTime: 0
    });
};

export const useSubjects = (payload: { Type: string; ASMAY_Id: number; EME_Id: number }, enabled = true) => {
    return useQuery({
        queryKey: [EXAM_REPORT_KEYS.SUBJECTS, payload],
        queryFn: () => getSubjects(payload),
        enabled: enabled && !!payload.ASMAY_Id && !!payload.EME_Id,
        staleTime: 0
    });
};

export const useStudentExamDetails = (payload: any, enabled = true) => {
    return useQuery({
        queryKey: [EXAM_REPORT_KEYS.STUDENT_DETAILS, payload],
        queryFn: () => getStudentExamDetails(payload),
        enabled: enabled,
        staleTime: 0
    });
};

export const getExamloadCumulativeReport = (payload: any, enabled = true) => {
    return useQuery({
        queryKey: [EXAM_REPORT_KEYS.STUDENT_DETAILS, payload],
        queryFn: () => getStudentExamDetails(payload),
        enabled: enabled,
        staleTime: 0
    });
};
