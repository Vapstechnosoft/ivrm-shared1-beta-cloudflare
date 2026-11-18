'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    filterStpeterEmployees,
    getStpeterDepts,
    getStpeterDesig,
    getStpeterEmployeeDetails,
    getStpeterEmployeeIdCardLoadData
} from '@/server/admission/preadmission/reports/stpeter_employee_id_card';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useStpeterEmployeeIdCardLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'stpeter_employee_id_card', 'load_data'],
        queryFn: () => getStpeterEmployeeIdCardLoadData()
    });
};

export const useGetStpeterDepts = () => {
    return useMutation({
        mutationFn: (data: { hrmgT_IdList: number[] }) => getStpeterDepts(data)
    });
};

export const useGetStpeterDesig = () => {
    return useMutation({
        mutationFn: (data: { hrmgT_IdList: number[]; hrmD_IdList: number[] }) => getStpeterDesig(data)
    });
};

export const useFilterStpeterEmployees = () => {
    return useMutation({
        mutationFn: (data: { hrmgT_IdList: number[]; hrmD_IdList: number[]; hrmdeS_IdList: number[] }) => filterStpeterEmployees(data)
    });
};

export const useGetStpeterEmployeeDetails = () => {
    return useMutation({
        mutationFn: (data: { hrmE_multiId: number[] }) => getStpeterEmployeeDetails(data)
    });
};
