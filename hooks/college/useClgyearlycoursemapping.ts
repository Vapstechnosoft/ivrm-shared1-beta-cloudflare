import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getClgYearlyCourseMappingInitialData,
    getClgYearlyCourseMappingBranches,
    getClgYearlyCourseMappingSemesters,
    searchClgYearlyCourseMappingData,
    saveClgYearlyCourseMappingData,
    viewClgYearlyCourseMappingRecords
} from '@/server/college/CollegeAdmission/Transactions/clgyearlycoursemapping';
import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';

export const useClgyearlycoursemappingData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.CLG_YEARLY_COURSE_MAPPING],
            queryFn: async () => getClgYearlyCourseMappingInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.CLG_YEARLY_COURSE_MAPPING]
            });
        }
    };
};

export const useGetClgyearlycoursemappingBranches = () => {
    return useMutation({
        mutationFn: async (data: any) => getClgYearlyCourseMappingBranches(data),
    });
};

export const useGetClgyearlycoursemappingSemesters = () => {
    return useMutation({
        mutationFn: async (data: any) => getClgYearlyCourseMappingSemesters(data),
    });
};

export const useSearchClgyearlycoursemappingData = () => {
    return useMutation({
        mutationFn: async (data: any) => searchClgYearlyCourseMappingData(data),
    });
};

export const useSaveClgyearlycoursemappingData = () => {
    return useMutation({
        mutationFn: async (data: any) => saveClgYearlyCourseMappingData(data),
    });
};

export const useViewClgyearlycoursemappingRecords = () => {
    return useMutation({
        mutationFn: async (data: any) => viewClgYearlyCourseMappingRecords(data),
    });
};
