import { PORTAL_QUERY_KEYS } from '@/constants/query-keys';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getCumulativeFeeAnalysisGrid, getstudentfeedetailsGrid } from '@/server/student-portal/masters/cumulative-fee-analysis';
import { getAcademicYearDropDown } from '@/server/student-portal/reports/student_exam_reports';

export const useStudentFeeDetailsGrid = (asmaY_Id: number, asmcL_Id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.STUDENT_FEE_DETAILS2, asmaY_Id, asmcL_Id],
            queryFn: async () => getstudentfeedetailsGrid(asmaY_Id, asmcL_Id)
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.STUDENT_FEE_DETAILS2]
            })
    };
};

export const useCumulativeFeeAnalysisGrid = (amst_Id: number, asmaY_Id: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.CUMULATIVE_FEE_ANALYSIS, asmaY_Id, asmaY_Id],
            queryFn: async () => getCumulativeFeeAnalysisGrid(amst_Id, asmaY_Id)
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.STUDENT_FEE_DETAILS2]
            })
    };
};

export const useAcademicYearExamReport = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.EXAM_STUDENT_REPORT_YEAR_DROP_DOWN],
            queryFn: async () => getAcademicYearDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.EXAM_STUDENT_REPORT_YEAR_DROP_DOWN]
            });
        }
    };
};

export const useAcademicStudentCompliants = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.EXAM_STUDENT_COMPLIANTS_YEAR_DROP_DOWN],
            queryFn: async () => getAcademicYearDropDown(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.EXAM_STUDENT_COMPLIANTS_YEAR_DROP_DOWN]
            });
        }
    };
};
