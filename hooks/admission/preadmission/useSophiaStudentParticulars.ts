'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getSophiaStudentParticularsLoadData,
    getSophiaStudentParticularsReport,
    getSophiaStudentParticularsStudentList
} from '@/server/admission/preadmission/reports/sophia_student_particulars';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSophiaStudentParticularsLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'sophia_student_particulars', 'load_data'],
        queryFn: () => getSophiaStudentParticularsLoadData(),
        staleTime: 0
    });
};

export const useSophiaStudentParticularsStudentList = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; ASMC_Id: number }) => getSophiaStudentParticularsStudentList(data)
    });
};

export const useSophiaStudentParticularsReport = () => {
    return useMutation({
        mutationFn: (data: any) => getSophiaStudentParticularsReport(data)
    });
};
