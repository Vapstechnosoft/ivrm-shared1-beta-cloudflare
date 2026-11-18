import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import { getInitialData } from '@/server/college/CollegeAdmission/Transactions/clgadmission-form';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    getPreadmissionStatusData,
    searchPreadmissionStudents,
    updatePreadmissionStatus,
    sendStatusOTP,
    verifyStatusOTP,
    getClgApplicationStudentRemarks,
    getClgApplicationStudentDocs,
    getClgApplicationData
} from '@/server/college/CollegeAdmission/Transactions/clg-preadmission-status';
import { IClgPreadmissionStatusFilter, IClgPreadmissionStatusUpdate } from '@/types/college/transactions';

export const useCollegeAdmissionFormInitialData = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_ADMISSION_FORM],
            queryFn: async () => getInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_ADMISSION_FORM]
            });
        }
    };
};

export const usePreadmissionStatusData = (data?: any) => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_PREADMISSION_STATUS, data],
        queryFn: async () => getPreadmissionStatusData(data),
    });
};

export const usePreadmissionStatusSearch = () => {
    return useMutation({
        mutationFn: async (data: IClgPreadmissionStatusFilter) => searchPreadmissionStudents(data),
    });
};

export const usePreadmissionStatusUpdate = () => {
    return useMutation({
        mutationFn: async (data: IClgPreadmissionStatusUpdate) => updatePreadmissionStatus(data),
    });
};

export const useSendStatusOTP = () => {
    return useMutation({
        mutationFn: async (data: { otptype: string; sms?: boolean; email?: boolean }) => sendStatusOTP(data),
    });
};

export const useVerifyStatusOTP = () => {
    return useMutation({
        mutationFn: async (data: { forgetEmailOTP: string }) => verifyStatusOTP(data),
    });
};

export const useClgApplicationStudentRemarks = () => {
    return useMutation({
        mutationFn: async (data: { pacA_Id: number }) => getClgApplicationStudentRemarks(data),
    });
};

export const useClgApplicationStudentDocs = () => {
    return useMutation({
        mutationFn: async (data: { pacA_Id: number }) => getClgApplicationStudentDocs(data),
    });
};

export const useClgApplicationData = () => {
    return useMutation({
        mutationFn: async (data: { pacA_Id: number }) => getClgApplicationData(data),
    });
};

// ─── Transfer Preadmission To Admission ─────────────────────────────────────

import {
    getTransferLoadData,
    getTransferBranches,
    getTransferSemesters,
    searchTransferStudents,
    exportToAdmission,
} from '@/server/college/CollegeAdmission/Transactions/clg-transfer-preadmission';

export const useTransferLoadData = () => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.TRANSACTION_TRANSFER_LOAD_DATA],
        queryFn: async () => getTransferLoadData(),
        staleTime: 0,
    });
};

export const useGetTransferBranches = () => {
    return useMutation({
        mutationFn: async (data: { courselistarray: { AMCO_Id: number }[] }) => getTransferBranches(data),
    });
};

export const useGetTransferSemesters = () => {
    return useMutation({
        mutationFn: async (data: {
            courselistarray: { AMCO_Id: number }[];
            branchlistarray: { AMB_Id: number }[];
        }) => getTransferSemesters(data),
    });
};

export const useSearchTransferStudents = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            courselistarray: { AMCO_Id: number }[];
            branchlistarray: { AMB_Id: number }[];
            semesterlistarray: { AMSE_Id: number }[];
        }) => searchTransferStudents(data),
    });
};

export const useExportToAdmission = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            courselistarray: { AMCO_Id: number }[];
            branchlistarray: { AMB_Id: number }[];
            semesterlistarray: { AMSE_Id: number }[];
            studentdetails: any[];
            configurationsettings: any;
        }) => exportToAdmission(data),
    });
};
