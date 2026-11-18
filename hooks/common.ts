import { QUERY_KEYS } from '@/constants/query-keys';
import { getCommonDropdown, getUserAccessibleModules, getUserNotificationList } from '@/server/common';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

export const useCommonDropdown = (name: string) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [name],
            queryFn: async () => getCommonDropdown(name),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [name]
            });
        }
    };
};

export const useUserNotification = (priority?: string) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.USER_NOTIFICATION, priority],
            queryFn: async () => getUserNotificationList(priority),
            staleTime: 0
            // refetchInterval: 10000 // Refetch every 10 seconds
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USER_NOTIFICATION]
            });
        }
    };
};

export const useUserAccessibleModules = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.USER_ACCESSIBLE_MODULES],
            queryFn: async () => {
                const res = await getUserAccessibleModules();
                if (res) {
                    console.info('main Modules', (res as any).mainModules);
                    console.info('subModules', (res as any).subModules);
                    console.info('pages', (res as any).pages);
                }
                return res;
            },
            staleTime: 0,
            gcTime: 30 * 60 * 1000, // 30 minutes cache
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            refetchOnReconnect: false
            // Removed refetchInterval - no need to poll every 10 seconds
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.USER_ACCESSIBLE_MODULES]
            });
        }
    };
};
