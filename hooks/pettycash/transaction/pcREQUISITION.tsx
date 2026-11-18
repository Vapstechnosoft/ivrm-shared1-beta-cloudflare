import { PETTYCASH_QUERY_KEYS } from '@/constants/pettycashandassettracking-query-keys';
import {
    GetDepartmentName,
    GetEmployeeName,
    GetParticularData,
    getPcRequisitionGrid,
    getRequisitionViewData
} from '@/server/pettycash/transaction/pcREQUISITION';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const usePcRequisition = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.PC_REQUISITION, searchParams ?? {}],
            queryFn: async () => getPcRequisitionGrid(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.PC_REQUISITION]
            })
    };
};

export const useDepartmentName = ({ id, enabled }: { id?: number; enabled: boolean }) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.DEPARTMENT_NAME, id],
            queryFn: async () => {
                if (!id) return null;
                return GetDepartmentName(id);
            },
            enabled: enabled && !!id,
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.DEPARTMENT_NAME]
            })
    };
};

export const useEmployeeName = ({ id, enabled }: { id?: number; enabled: boolean }) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.EMPLOYEE_NAME, id],
            queryFn: async () => GetEmployeeName(id!),
            enabled: !!id && enabled,
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.EMPLOYEE_NAME]
            })
    };
};

export const useParticularGetData = ({ id, enabled }: { id?: number; enabled: boolean }) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.PARTICULAR_DATA, id],
            queryFn: async () => GetParticularData(id!),
            enabled: !!id && enabled,
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.PARTICULAR_DATA]
            })
    };
};

export const useRequisitionViewData = ({ id, enabled }: { id?: number; enabled: boolean }) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.REQUISITION_VIEW_DATA, id],
            queryFn: async () => getRequisitionViewData(id!),
            enabled: !!id && enabled,
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.REQUISITION_VIEW_DATA]
            })
    };
};
