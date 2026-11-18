import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    getCollegeFeeRefundableAllDetails,
    getCollegeFeeRefundableOnSelectGroup,
    getCollegeFeeRefundableStudent,
    getCollegeFeeRefundableStudentListByAmst
} from '@/server/fees/college/transaction/clgfeerefundable';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Re-export academic years hook (shared with waivedoff)
export { useCollegeAcademicYears, useCollegeCourses, useCollegeBranches, useCollegeSemesters } from './useTransactions';

// 1. Main grid list
export const useCollegeFeeRefundableList = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_LIST, searchParams ?? {}],
            queryFn: async () => getCollegeFeeRefundableAllDetails(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return Promise.all([
                queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_LIST] }),
                queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_STUDENTS] }),
                queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_STUDENT_BY_AMST] }),
                queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_GROUPS] }),
                queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_HEADS] })
            ]);
        }
    };
};

// 2. Students by year/course/branch/semester
export const useCollegeFeeRefundableStudents = (asmaY_Id?: number, amcO_Id?: number, amB_Id?: number, amsE_Id?: number) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_STUDENTS, asmaY_Id, amcO_Id, amB_Id, amsE_Id],
            queryFn: async () => {
                if (!asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id) return null;
                return getCollegeFeeRefundableStudent({ asmaY_Id, amcO_Id, amB_Id, amsE_Id });
            },
            enabled: !!asmaY_Id && !!amcO_Id && !!amB_Id && !!amsE_Id
        }),
        refetchAll: () => queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_STUDENTS] })
    };
};

// 3. Student list by amst (for fee heads loading)
export const useCollegeFeeRefundableStudentByAmst = (payload?: {
    amcsT_Id?: number;
    asmaY_Id?: number;
    filterrefund?: string;
}) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [
                COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_STUDENT_BY_AMST,
                payload?.amcsT_Id,
                payload?.asmaY_Id,
                payload?.filterrefund
            ],
            queryFn: async () => {
                if (!payload?.amcsT_Id || !payload?.asmaY_Id || !payload?.filterrefund) return null;
                return getCollegeFeeRefundableStudentListByAmst({
                    amcsT_Id: payload.amcsT_Id,
                    asmaY_Id: payload.asmaY_Id,
                    filterrefund: payload.filterrefund
                });
            },
            enabled: !!payload?.amcsT_Id && !!payload?.asmaY_Id && !!payload?.filterrefund
        }),
        refetchAll: () => queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_STUDENT_BY_AMST] })
    };
};

// 4. Fee heads via onselectgroup
export const useCollegeFeeRefundableHeads = (payload?: {
    asmaY_Id?: number;
    amcsT_Id?: number;
    filterrefund?: string;
    multiplegroupF?: number[];
}) => {
    const queryClient = useQueryClient();
    const groupKey = payload?.multiplegroupF?.join(',') ?? '';
    return {
        ...useQuery({
            queryKey: [
                COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_HEADS,
                payload?.asmaY_Id,
                payload?.amcsT_Id,
                payload?.filterrefund,
                groupKey
            ],
            queryFn: async () => {
                if (!payload?.asmaY_Id || !payload?.amcsT_Id || !payload?.filterrefund || !payload?.multiplegroupF?.length) return null;
                return getCollegeFeeRefundableOnSelectGroup({
                    asmaY_Id: payload.asmaY_Id,
                    amcsT_Id: payload.amcsT_Id,
                    filterrefund: payload.filterrefund,
                    multiplegroupF: payload.multiplegroupF
                });
            },
            enabled: !!payload?.asmaY_Id && !!payload?.amcsT_Id && !!payload?.filterrefund && !!payload?.multiplegroupF?.length
        }),
        refetchAll: () => queryClient.invalidateQueries({ queryKey: [COLLEGE_QUERY_KEYS.COLLEGE_FEE_REFUNDABLE_HEADS] })
    };
};
