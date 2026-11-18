import { PETTYCASH_QUERY_KEYS } from '@/constants/pettycashandassettracking-query-keys';
import { RequistionReport, getRequisitionReportOrganization } from '@/server/pettycash/report/PcRequisitionReport';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const UsePcRequisitionReport = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.PC_REQUISITION, searchParams ?? {}],
            queryFn: async () => RequistionReport(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.PC_REQUISITION]
            })
    };
};

export const UsePcRequisitionReportOrganization = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PETTYCASH_QUERY_KEYS.PC_REQUISITION, searchParams ?? {}],
            queryFn: async () => getRequisitionReportOrganization(searchParams),
            staleTime: 0
        }),
        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PETTYCASH_QUERY_KEYS.PC_REQUISITION]
            })
    };
};
