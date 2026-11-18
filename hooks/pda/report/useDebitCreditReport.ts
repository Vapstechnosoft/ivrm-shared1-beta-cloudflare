import { PDA_QUERY_KEYS } from '@/constants/pda-query-keys';
import { getSectionDetails, getStudentDetails } from '@/server/pda/pda-common';
import { generatePDADebitCreditReportSRS, getPDAReportLoadData } from '@/server/pda/report/debit-credit-report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const usePDAReportLoadData = () => {
    return useQuery({
        queryKey: [PDA_QUERY_KEYS.MASTER_HEAD, 'load-data'], // Reusing PDA_QUERY_KEYS or could add more
        queryFn: async () => getPDAReportLoadData()
    });
};

export const usePDASectionsSRS = (asmayId?: number, asmclId?: number) => {
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

export const usePDAStudentsSRS = (asmayId?: number, asmclId?: number, asmsId?: number) => {
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

export const useGeneratePDAReportSRS = () => {
    return useMutation({
        mutationFn: generatePDADebitCreditReportSRS
    });
};
