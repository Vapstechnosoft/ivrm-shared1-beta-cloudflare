'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    changeClassStpeterStudentIdCard,
    changeSectionStpeterStudentIdCard,
    changeYearStpeterStudentIdCard,
    getStpeterStudentIdCardLoadData,
    getStpeterStudentIdCardReport
} from '@/server/admission/preadmission/reports/stpeter_student_id_card';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useStpeterStudentIdCardLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'stpeter_student_id_card', 'load_data'],
        queryFn: () => getStpeterStudentIdCardLoadData()
    });
};

export const useChangeYearStpeterStudentIdCard = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => changeYearStpeterStudentIdCard(data)
    });
};

export const useChangeClassStpeterStudentIdCard = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number }) => changeClassStpeterStudentIdCard(data)
    });
};

export const useChangeSectionStpeterStudentIdCard = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) => changeSectionStpeterStudentIdCard(data)
    });
};

export const useStpeterStudentIdCardReport = () => {
    return useMutation({
        mutationFn: (data: any) => getStpeterStudentIdCardReport(data)
    });
};
