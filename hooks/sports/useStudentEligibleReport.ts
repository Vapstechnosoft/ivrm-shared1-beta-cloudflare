import {
    getClassesForStudentEligible,
    getSectionsForStudentEligible,
    getStudentEligibleReport,
    getStudentEligibleReportLoadData,
    getStudentsForStudentEligible
} from '@/server/sports/reports/student-eligible-report';
import type { IStudentEligibleReportRequest } from '@/types/sports/reports/student-eligible-report';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

export const useStudentEligibleReport = (payload?: IStudentEligibleReportRequest, searchParams?: any) => {
    const loadGrid = useQuery({
        queryKey: ['student-eligible-report-load'],
        queryFn: getStudentEligibleReportLoadData
    });

    const getClasses = useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => getClassesForStudentEligible(data.ASMAY_Id)
    });

    const getSections = useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number }) => getSectionsForStudentEligible(data.ASMAY_Id, data.ASMCL_Id)
    });

    const getStudents = useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) =>
            getStudentsForStudentEligible(data.ASMAY_Id, data.ASMCL_Id, data.ASMS_Id)
    });

    const showDetails = useMutation({
        mutationFn: (data: { payload: IStudentEligibleReportRequest; searchParams?: any }) =>
            getStudentEligibleReport(data.payload, data.searchParams)
    });

    // Added query for report data to support search/sort/pagination without infinite loops
    const reportQuery = useQuery({
        queryKey: ['student-eligible-report-data', payload, searchParams],
        queryFn: () => (payload ? getStudentEligibleReport(payload, searchParams) : null),
        enabled: !!payload,
        placeholderData: keepPreviousData,
        staleTime: 0
    });

    return {
        ...loadGrid,
        getClasses,
        getSections,
        getStudents,
        showDetails,
        reportQuery
    };
};
