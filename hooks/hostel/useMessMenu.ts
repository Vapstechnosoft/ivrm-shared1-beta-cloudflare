import { HOSTEL_QUERY_KEYS } from '@/constants/query-keys';
import { getMessMenuList } from '@/server/hostel/hostel-management/masters/menu';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Define a key for the query

export const useMessMenu = (searchParams?: { [key: string]: string | string[] | undefined }) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HOSTEL_QUERY_KEYS.MESS_MENU_GRID_LIST, searchParams ?? {}],
            queryFn: async () => getMessMenuList(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HOSTEL_QUERY_KEYS.MESS_MENU_GRID_LIST]
            });
        }
    };
};
