import { TIMETABLE_QUERY_KEYS } from '@/constants/Timetable-query-keys';
import {
    getPDADebitCreditReport,
    getPDADebitCreditReportInitialData,
    getPDADebitCreditReportSections,
    getPDADebitCreditReportStudents
} from '@/server/pettycash/report/PDADebitCreditReport';
import type { IPDADebitCreditReportParams } from '@/types/pettycash/report/PDADebitCreditReport';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const usePDADebitCreditReportInitialData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS, 'PDA_DEBIT_CREDIT_REPORT_INITIAL_DATA'],
            queryFn: () => getPDADebitCreditReportInitialData(),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [TIMETABLE_QUERY_KEYS.BIFURCATION_CONSTRAINTS]
            });
        }
    };
};

export const usePDADebitCreditReportSectionsMutation = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number }) => getPDADebitCreditReportSections(data)
    });
};

export const usePDADebitCreditReportStudentsMutation = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; AMSC_Id: number }) => getPDADebitCreditReportStudents(data)
    });
};

export const usePDADebitCreditReportMutation = () => {
    return useMutation({
        mutationFn: (data: IPDADebitCreditReportParams) => getPDADebitCreditReport(data)
    });
};
