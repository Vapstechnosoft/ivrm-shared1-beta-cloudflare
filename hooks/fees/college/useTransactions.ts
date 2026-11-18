import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCollegeBranches,
    getCollegeCourses,
    getCollegeFeeWaivedOffAllDetails,
    getCollegeFeeWaivedOffEditDetails,
    getCollegeGroups,
    getCollegeHeads,
    getCollegeSemesters,
    getCollegeStudents
} from '@/server/fees/college/transaction/clgfeewaivedoff';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCollegeFeePrivilegeAcademicYears } from '@/server/fees/college/masters/masterclgfeeprevilege';

export const useCollegeAcademicYears = () => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_TRANSACTION, 'ACADEMIC_YEARS'],
            queryFn: async () => getCollegeFeePrivilegeAcademicYears(),
            staleTime: 1000 * 60 * 10
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_TRANSACTION, 'ACADEMIC_YEARS']
            })
    };
};

// 1. Hook for Main Grid & All Details
export const useCollegeFeeWaivedOffList = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_LIST, searchParams ?? {}],
            queryFn: async () => getCollegeFeeWaivedOffAllDetails(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_LIST]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_COURSES]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_BRANCHES]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_SEMESTERS]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_STUDENTS]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_GROUPS]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_HEADS]
                }),
                queryClient.invalidateQueries({
                    queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_EDIT]
                })
            ]);
        }
    };
};

// 2. Hook for Courses by Academic Year
export const useCollegeCourses = (asmaY_Id?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_COURSES, asmaY_Id],
            queryFn: async () => {
                if (!asmaY_Id) return null;
                return getCollegeCourses(asmaY_Id);
            },
            enabled: !!asmaY_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_COURSES]
            });
        }
    };
};

// 3. Hook for Branches by Course
export const useCollegeBranches = (asmaY_Id?: number, amcO_Id?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_BRANCHES, asmaY_Id, amcO_Id],
            queryFn: async () => {
                if (!asmaY_Id || !amcO_Id) return null;
                return getCollegeBranches(asmaY_Id, amcO_Id);
            },
            enabled: !!asmaY_Id && !!amcO_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_BRANCHES]
            });
        }
    };
};

// 4. Hook for Semesters by Branch
export const useCollegeSemesters = (asmaY_Id?: number, amcO_Id?: number, amB_Id?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_SEMESTERS, asmaY_Id, amcO_Id, amB_Id],
            queryFn: async () => {
                if (!asmaY_Id || !amcO_Id || !amB_Id) return null;
                return getCollegeSemesters(asmaY_Id, amcO_Id, amB_Id);
            },
            enabled: !!asmaY_Id && !!amcO_Id && !!amB_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_SEMESTERS]
            });
        }
    };
};

// 5. Hook for Students by Semester
export const useCollegeStudents = (asmaY_Id?: number, amcO_Id?: number, amB_Id?: number, amsE_Id?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_STUDENTS, asmaY_Id, amcO_Id, amB_Id, amsE_Id],
            queryFn: async () => {
                if (!asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id) return null;
                return getCollegeStudents(asmaY_Id, amcO_Id, amB_Id, amsE_Id);
            },
            enabled: !!asmaY_Id && !!amcO_Id && !!amB_Id && !!amsE_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_STUDENTS]
            });
        }
    };
};

// 6. Hook for Fee Groups by Student & Refundable Option
export const useCollegeFeeGroups = (asmaY_Id?: number, amcsT_Id?: number, filterrefund?: string) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_GROUPS, asmaY_Id, amcsT_Id, filterrefund],
            queryFn: async () => {
                if (!asmaY_Id || !amcsT_Id || !filterrefund) return null;
                return getCollegeGroups({ asmaY_Id, amcsT_Id, filterrefund });
            },
            enabled: !!asmaY_Id && !!amcsT_Id && !!filterrefund
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_GROUPS]
            });
        }
    };
};

// 7. Hook for Fee Heads
export const useCollegeFeeHeads = (payload?: {
    ASMAY_Id?: number;
    AMCST_Id?: number;
    filterrefund?: string;
    multiplegroup?: string;
}) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [
                COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_HEADS,
                payload?.ASMAY_Id,
                payload?.AMCST_Id,
                payload?.filterrefund,
                payload?.multiplegroup
            ],
            queryFn: async () => {
                if (!payload?.ASMAY_Id || !payload?.AMCST_Id || !payload?.filterrefund || !payload?.multiplegroup) {
                    return null;
                }
                return getCollegeHeads({
                    ASMAY_Id: payload.ASMAY_Id,
                    AMCST_Id: payload.AMCST_Id,
                    filterrefund: payload.filterrefund,
                    multiplegroup: payload.multiplegroup
                });
            },
            enabled: !!payload?.ASMAY_Id && !!payload?.AMCST_Id && !!payload?.filterrefund && !!payload?.multiplegroup
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_HEADS]
            });
        }
    };
};

// 8. Hook for Edit Details
export const useCollegeFeeWaivedOffEdit = (fcswO_Id?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_EDIT, fcswO_Id],
            queryFn: async () => {
                if (!fcswO_Id) return null;
                return getCollegeFeeWaivedOffEditDetails(fcswO_Id);
            },
            enabled: !!fcswO_Id
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_WAIVED_OFF_EDIT]
            });
        }
    };
};
