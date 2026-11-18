import { PDA_QUERY_KEYS } from '@/constants/pda-query-keys';
import { getAcademicYearData, getCategoryDetails, getClassDetails, getSectionDetails, getStudentDetails } from '@/server/pda/pda-common';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// export const usePDAAcademicYear = () => {
//     return useQuery({
//         queryKey: ['pda-academic-years'],
//         queryFn: async () => getAcademicYearData()
//     });
// };

export const usePDAAcademicYear = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PDA_QUERY_KEYS.ACADEMIC_YEAR],
            queryFn: async () => getAcademicYearData(),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PDA_QUERY_KEYS.MASTER_HEAD]
            })
    };
};

export const usePDAClass = (asmayId?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PDA_QUERY_KEYS.CLASS_DETAILS, asmayId],
            queryFn: async () => getClassDetails(asmayId),
            staleTime: 0,
            enabled: !!asmayId
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PDA_QUERY_KEYS.MASTER_HEAD]
            })
    };
};

export const usePDASection = (asmayId?: number, asmclId?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PDA_QUERY_KEYS.SECTION_DETAILS, asmayId, asmclId],
            queryFn: async () => getSectionDetails(asmayId, asmclId),
            staleTime: 0,
            enabled: !!asmayId && !!asmclId
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PDA_QUERY_KEYS.MASTER_HEAD]
            })
    };
};

export const usePDACategory = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PDA_QUERY_KEYS.CATEGORY_DETAILS],
            queryFn: async () => getCategoryDetails(),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PDA_QUERY_KEYS.MASTER_HEAD]
            })
    };
};

export const usePDAStudent = (asmayId?: number, asmclId?: number, asmsId?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PDA_QUERY_KEYS.STUDENT_DETAILS, asmayId, asmclId, asmsId],
            queryFn: async () => getStudentDetails(asmayId, asmclId, asmsId),
            staleTime: 0,
            enabled: !!asmayId && !!asmclId && !!asmsId
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PDA_QUERY_KEYS.MASTER_HEAD]
            })
    };
};
