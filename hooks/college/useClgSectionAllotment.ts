import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getClgSectionAllotmentInitialData,
    getClgSectionAllotmentAcademicCourses,
    getClgSectionAllotmentStudentDetailsByYear,
    getClgSectionAllotmentBranches,
    getClgSectionAllotmentSemesters,
    getClgSectionAllotmentStudents,
    saveClgSectionAllotment,
    getClgSectionAllotmentPromoCourses,
    getClgSectionAllotmentPromoBranches,
    getClgSectionAllotmentPromoSemesters,
    getClgSectionAllotmentPromoSemOnChange,
    getClgSectionAllotmentYearLossAcademic,
    getClgSectionAllotmentYearLossBranch,
    getClgSectionAllotmentYearLossSem,
    getClgSectionAllotmentYearLossStudents,
    getClgSectionAllotmentStudentsByURN,
    saveClgSectionAllotmentRollNo,
    getClgSectionAllotmentCBSStudents,
    saveClgSectionAllotmentCourseBranch
} from '@/server/college/CollegeAdmission/Transactions/clgsectionallotment';
import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';

export const useClgSectionAllotmentInitialData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.CLG_SECTION_ALLOTMENT],
            queryFn: async () => getClgSectionAllotmentInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.CLG_SECTION_ALLOTMENT]
            });
        }
    };
};

export const useGetClgSectionAllotmentAcademicCourses = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number }) => getClgSectionAllotmentAcademicCourses(data)
    });
};

export const useGetClgSectionAllotmentStudentDetailsByYear = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number }) => getClgSectionAllotmentStudentDetailsByYear(data)
    });
};

export const useGetClgSectionAllotmentBranches = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number }) => getClgSectionAllotmentBranches(data)
    });
};

export const useGetClgSectionAllotmentSemesters = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) => getClgSectionAllotmentSemesters(data)
    });
};

export const useGetClgSectionAllotmentStudents = () => {
    return useMutation({
        mutationFn: async (data: any) => getClgSectionAllotmentStudents(data)
    });
};

export const useSaveClgSectionAllotment = () => {
    return useMutation({
        mutationFn: async (data: any) => saveClgSectionAllotment(data)
    });
};

// Promotion hooks
export const useGetClgSectionAllotmentPromoCourses = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number }) => getClgSectionAllotmentPromoCourses(data)
    });
};

export const useGetClgSectionAllotmentPromoBranches = () => {
    return useMutation({
        mutationFn: async (data: { AMCO_Id: number; ASMAY_Id: number }) => getClgSectionAllotmentPromoBranches(data)
    });
};

export const useGetClgSectionAllotmentPromoSemesters = () => {
    return useMutation({
        mutationFn: async (data: { AMB_Id: number; ASMAY_Id: number; AMCO_Id: number }) => getClgSectionAllotmentPromoSemesters(data)
    });
};

export const useGetClgSectionAllotmentPromoSemOnChange = () => {
    return useMutation({
        mutationFn: async (data: { AMB_Id: number; ASMAY_Id: number; AMCO_Id: number; AMSE_Id: number }) =>
            getClgSectionAllotmentPromoSemOnChange(data)
    });
};

// Year Loss hooks
export const useGetClgSectionAllotmentYearLossAcademic = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number }) => getClgSectionAllotmentYearLossAcademic(data)
    });
};

export const useGetClgSectionAllotmentYearLossBranch = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number }) => getClgSectionAllotmentYearLossBranch(data)
    });
};

export const useGetClgSectionAllotmentYearLossSem = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) => getClgSectionAllotmentYearLossSem(data)
    });
};

export const useGetClgSectionAllotmentYearLossStudents = () => {
    return useMutation({
        mutationFn: async (data: any) => getClgSectionAllotmentYearLossStudents(data)
    });
};

// Roll No hooks
export const useGetClgSectionAllotmentStudentsByURN = () => {
    return useMutation({
        mutationFn: async (data: any) => getClgSectionAllotmentStudentsByURN(data)
    });
};

export const useSaveClgSectionAllotmentRollNo = () => {
    return useMutation({
        mutationFn: async (data: any) => saveClgSectionAllotmentRollNo(data)
    });
};

// Change Course & Branch hooks
export const useGetClgSectionAllotmentCBSStudents = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMCO_Id: number;
            AMB_Id: number;
            AMSE_Id: number;
        }) => getClgSectionAllotmentCBSStudents(data)
    });
};

export const useSaveClgSectionAllotmentCourseBranch = () => {
    return useMutation({
        mutationFn: async (data: any) => saveClgSectionAllotmentCourseBranch(data)
    });
};

