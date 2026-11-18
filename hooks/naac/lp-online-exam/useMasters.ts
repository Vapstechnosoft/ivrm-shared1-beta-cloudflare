import { LP_ONLINE_EXAM_QUERY_KEYS } from '@/constants/query-keys';
import {
    deleteMasterExam,
    getMasterExamList,
    getMasterOEExamInitialLoad,
    saveMasterExam,
    toggleMasterExam
} from '@/server/naac/lp-online-exam/master-oe-exam';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Hook to fetch initial dropdown data (year, class, subject) + exam list
export function useMasterOEExam() {
    const queryClient = useQueryClient();

    const initialDataQuery = useQuery({
        queryKey: [LP_ONLINE_EXAM_QUERY_KEYS.MASTER_OE_EXAM_INITIAL_DATA],
        queryFn: async () => {
            try {
                const res = await getMasterOEExamInitialLoad();
                if (res?.data) return res.data;
                if (res?.success) return res.data || res;
                return res || {};
            } catch (e) {
                return {};
            }
        },
        staleTime: 5 * 60 * 1000
    });

    const examListQuery = useQuery({
        queryKey: [LP_ONLINE_EXAM_QUERY_KEYS.MASTER_OE_EXAM],
        queryFn: async () => {
            try {
                const res: any = await getMasterExamList({});
                if (res?.data) {
                    const data = res.data?.$values || res.data;
                    return Array.isArray(data) ? data : [];
                }
                if (Array.isArray(res)) return res;
            } catch (e) {}
            return [];
        },
        staleTime: 0
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({ queryKey: [LP_ONLINE_EXAM_QUERY_KEYS.MASTER_OE_EXAM] });
    };

    return {
        initialData: initialDataQuery.data,
        isInitialLoading: initialDataQuery.isLoading,
        data: examListQuery.data ?? [],
        isLoading: examListQuery.isLoading,
        error: examListQuery.error,
        refetchAll
    };
}

// Hook to Save / Update Master OE Exam
export function useSaveMasterOEExam() {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async (payload: any) => {
            const res = await saveMasterExam(payload);
            if (res?.success) {
                queryClient.invalidateQueries({ queryKey: [LP_ONLINE_EXAM_QUERY_KEYS.MASTER_OE_EXAM] });
            }
            return res;
        }
    };
}

// Hook to Toggle Master OE Exam status
export function useToggleMasterOEExam() {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async (id: number) => {
            const res = await toggleMasterExam(id);
            if (res?.success) {
                queryClient.invalidateQueries({ queryKey: [LP_ONLINE_EXAM_QUERY_KEYS.MASTER_OE_EXAM] });
            }
            return res;
        }
    };
}

// Hook to Delete Master OE Exam
export function useDeleteMasterOEExam() {
    const queryClient = useQueryClient();
    return {
        mutateAsync: async (id: number) => {
            const res = await deleteMasterExam(id);
            if (res?.success) {
                queryClient.invalidateQueries({ queryKey: [LP_ONLINE_EXAM_QUERY_KEYS.MASTER_OE_EXAM] });
            }
            return res;
        }
    };
}
