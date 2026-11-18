import {
    checkTCDuplication,
    getStudentDetailsOnNameChange,
    getStudentNameList,
    getStudentTCDetails,
    // getStudentTCInitialData,
    // getStudentTCList,
    getStudentsByAcademicYear,
    getTCCancelDetails,
    getTCCancelInitialData,
    onChangeAcademicYearForCancel,
    onStudentNameChangeForCancel,
    saveStudentTC,
    saveTCCancelDetails,
    searchStudentFilter
} from '@/server/admission/preadmission/transactions/student_tc';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useStudentsByAcademicYear = (asmayId: number) => {
    return useQuery({
        queryKey: ['student_tc_student_list', asmayId],
        queryFn: () => getStudentsByAcademicYear(asmayId),
        enabled: !!asmayId && asmayId > 0,
        staleTime: 0
    });
};

export const useStudentDetailsOnNameChange = () => {
    return useMutation({
        mutationFn: (params: { asmayId: number; amstId: number }) => getStudentDetailsOnNameChange(params.asmayId, params.amstId),
        mutationKey: ['student_tc_details_name_change']
    });
};

export const useTCCancelDetails = () => {
    return useMutation({
        mutationFn: (params: { asmayId: number; amstId: number; reason?: string }) =>
            getTCCancelDetails(params.asmayId, params.amstId, params.reason),
        mutationKey: ['student_tc_cancel_details']
    });
};

// export const useStudentTCInitialData = () => {
//     return useMutation({
//         mutationFn: (data: any) => getStudentTCInitialData(data),
//         mutationKey: ['student_tc_initial_data']
//     });
// };

// export const useStudentTCList = () => {
//     return useMutation({
//         mutationFn: (data: any) => getStudentTCList(data),
//         mutationKey: ['student_tc_list']
//     });
// };

export const useStudentTCDetails = () => {
    return useMutation({
        mutationFn: (params: { amstId: number; asmayId: number; statusFlag: string; feetobepaid?: number }) =>
            getStudentTCDetails(params.amstId, params.asmayId, params.statusFlag, params.feetobepaid),
        mutationKey: ['student_tc_details']
    });
};

export const useSaveStudentTC = () => {
    return useMutation({
        mutationFn: (data: any) => saveStudentTC(data),
        mutationKey: ['save_student_tc']
    });
};

// --- TC Cancel Hooks ---

export const useTCCancelInitialData = () => {
    return useQuery({
        queryFn: () => getTCCancelInitialData(),
        queryKey: ['student_tc_cancel_initial_data'],
        staleTime: 0
    });
};

export const useChangeAcademicYearForCancel = () => {
    return useMutation({
        mutationFn: (asmayId: number) => onChangeAcademicYearForCancel(asmayId),
        mutationKey: ['student_tc_cancel_change_year']
    });
};

export const useStudentNameChangeForCancel = () => {
    return useMutation({
        mutationFn: (params: { asmayId: number; amstId: number }) => onStudentNameChangeForCancel(params.asmayId, params.amstId),
        mutationKey: ['student_tc_cancel_student_change']
    });
};

export const useSaveTCCancelDetails = () => {
    return useMutation({
        mutationFn: (data: any) => saveTCCancelDetails(data),
        mutationKey: ['save_student_tc_cancel']
    });
};

export const useCheckTCDuplication = () => {
    return useMutation({
        mutationFn: (params: { asmayId: number; tcNo: string }) => checkTCDuplication(params.asmayId, params.tcNo),
        mutationKey: ['check_tc_duplication']
    });
};

export const useStudentNameList = (asmayId: number, amstId = 0, flag = 'S') => {
    return useQuery({
        queryKey: ['student_tc_name_list', asmayId, amstId, flag],
        queryFn: () => getStudentNameList(asmayId, amstId, flag),
        staleTime: 0
    });
};

export const useStudentSearchFilter = () => {
    return useMutation({
        mutationFn: (params: { asmayId: number; amstSol: string; searchfilter: string; flag: string }) =>
            searchStudentFilter(params.asmayId, params.amstSol, params.searchfilter, params.flag),
        mutationKey: ['student_tc_search_filter']
    });
};
