import { PORTAL_QUERY_KEYS } from '@/constants/query-keys';
import { getStudentDashboardClasswork, getStudentDashboardNoticeBoard } from '@/server/student-portal/student-dashboard';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useNoticeBoard = (amstId?: number, yearId?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.NOTICE_BOARD_LIST, amstId, yearId],
            queryFn: async () => {
                const requestData = {
                    AMST_Id: amstId,
                    ASMAY_Id: yearId
                };
                const result = await getStudentDashboardNoticeBoard(requestData);
                return result.data?.noticelist_byid || [];
            },
            enabled: !!amstId && !!yearId
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.NOTICE_BOARD_LIST]
            })
    };
};

export const useClasswork = (amstId?: number, yearId?: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PORTAL_QUERY_KEYS.CLASSWORK_LIST, amstId, yearId],
            queryFn: async () => {
                const requestData = {
                    AMST_Id: amstId,
                    ASMAY_Id: yearId
                };
                const result = await getStudentDashboardClasswork(requestData);
                return result.data?.classworklist_byid || [];
            },
            enabled: !!amstId && !!yearId
        }),

        refetchAll: () =>
            queryClient.invalidateQueries({
                queryKey: [PORTAL_QUERY_KEYS.CLASSWORK_LIST]
            })
    };
};
