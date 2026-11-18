import { PORTAL_QUERY_KEYS } from '@/constants/query-keys';
import {
    fetchNoticeBoardInitialData,
    getBusRoutingForNoticeBoard,
    getFeeGroupsForNoticeBoard,
    getFeeTermsForNoticeBoard,
    getNoticeBoardDepartments,
    getNoticeBoardDesignations,
    getNoticeBoardEmployees,
    getNoticeBoardSections,
    getNoticeBoardStudents
} from '@/server/upload/transactions/notice-board/server-action';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useNoticeBoard = () => {
    return useQuery({
        queryKey: [PORTAL_QUERY_KEYS.HOME_WORK_UPLOADED, 'notice-board-details'], // Reusing a similar key prefix or custom
        queryFn: async () => {
            const result = await fetchNoticeBoardInitialData();
            if (result.success === false) {
                toast.error(result.message || 'Failed to load notice board data');
                throw new Error(result.message);
            }
            return result;
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};

export const useNoticeBoardSections = () => {
    return useMutation({
        mutationFn: (payload: any) => getNoticeBoardSections(payload)
    });
};

export const useNoticeBoardStudents = () => {
    return useMutation({
        mutationFn: (payload: any) => getNoticeBoardStudents(payload)
    });
};

export const useNoticeBoardDepartments = () => {
    return useQuery({
        queryKey: [PORTAL_QUERY_KEYS.GET_DEPARTMENT_FOR_NOTICE_BOARD],
        queryFn: async () => getNoticeBoardDepartments({}),
        staleTime: 30 * 60 * 1000
    });
};

export const useNoticeBoardDesignations = () => {
    return useQuery({
        queryKey: [PORTAL_QUERY_KEYS.GET_DESIGNATION_FOR_NOTICE_BOARD],
        queryFn: async () => getNoticeBoardDesignations({}),
        staleTime: 30 * 60 * 1000
    });
};

export const useNoticeBoardEmployees = () => {
    return useMutation({
        mutationFn: (payload: any) => getNoticeBoardEmployees(payload)
    });
};

export const useEmployeesForNoticeBoard = () => {
    return useQuery({
        queryKey: [PORTAL_QUERY_KEYS.GET_EMPLOYEES_FOR_NOTICE_BOARD],
        queryFn: async () => getNoticeBoardEmployees({}),
        staleTime: 30 * 60 * 1000
    });
};

export const useBusRoutingForNoticeBoardQuery = () => {
    return useQuery({
        queryKey: [PORTAL_QUERY_KEYS.GET_ROUTES_FOR_NOTICE_BOARD],
        queryFn: async () => getBusRoutingForNoticeBoard(),
        staleTime: 30 * 60 * 1000
    });
};

export const useFeeGroupsForNoticeBoardQuery = () => {
    return useQuery({
        queryKey: [PORTAL_QUERY_KEYS.GET_GROUPS_FOR_NOTICE_BOARD],
        queryFn: async () => getFeeGroupsForNoticeBoard(),
        staleTime: 30 * 60 * 1000
    });
};

export const useFeeTermsForNoticeBoardQuery = () => {
    return useQuery({
        queryKey: [PORTAL_QUERY_KEYS.GET_TERMS_FOR_NOTICE_BOARD],
        queryFn: async () => getFeeTermsForNoticeBoard(),
        staleTime: 30 * 60 * 1000
    });
};
