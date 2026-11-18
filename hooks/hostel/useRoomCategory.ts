'use client';
import { HOSTEL_QUERY_KEYS } from '@/constants/query-keys';
import { getRoomCategoryDropdownList, getRoomCategoryList } from '@/server/hostel/hostel-management/masters/room-category';
import { useQuery } from '@tanstack/react-query';

export const useRoomCategory = (searchParams?: { [key: string]: string | string[] | undefined }) => {
    return {
        ...useQuery({
            queryKey: [HOSTEL_QUERY_KEYS.MASTER_ROOM_CATEGORY_LIST, searchParams ?? {}],
            queryFn: async () => getRoomCategoryList(),
            staleTime: 0
        }),
        refetchAll: async () => {
            // InvalidateQueries or manual refetch handled by react-query if usage component calls refetch
        },
        // Just standard useQuery return is mostly sufficient, but matching pattern
        queryKey: HOSTEL_QUERY_KEYS.MASTER_ROOM_CATEGORY_LIST
    };
};

export const useRoomCategoryDropdownList = (searchParams?: { [key: string]: string | string[] | undefined }) => {
    return {
        ...useQuery({
            queryKey: [HOSTEL_QUERY_KEYS.MASTER_ROOM_CATEGORY_DROPDOWN_LIST, searchParams ?? {}],
            queryFn: async () => getRoomCategoryDropdownList(),
            select: (data) => data?.data || [],
            staleTime: 0
        }),

        refetchAll: async () => {
            // InvalidateQueries or manual refetch handled by react-query if usage component calls refetch
        },
        // Just standard useQuery return is mostly sufficient, but matching pattern
        queryKey: HOSTEL_QUERY_KEYS.MASTER_ROOM_CATEGORY_DROPDOWN_LIST
    };
};
