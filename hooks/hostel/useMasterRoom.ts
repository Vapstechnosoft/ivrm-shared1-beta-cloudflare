import { HOSTEL_QUERY_KEYS } from '@/constants/query-keys';
import {
    getFloorsByHostel,
    getRoomCategoryByHostel,
    getRoomDropdownList,
    getRoomList
} from '@/server/hostel/hostel-management/masters/room';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMasterRoom = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HOSTEL_QUERY_KEYS.MATER_ROOM_GRID_LIST, searchParams],
            queryFn: () => getRoomList(searchParams),
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HOSTEL_QUERY_KEYS.MATER_ROOM_GRID_LIST]
            });
        }
    };
};

export const useMasterRoomDropdown = () => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [HOSTEL_QUERY_KEYS.MASTER_ROOM_DROPDOWN_LIST],
            queryFn: () => getRoomDropdownList(),
            refetchOnWindowFocus: false
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HOSTEL_QUERY_KEYS.MASTER_ROOM_DROPDOWN_LIST]
            });
        }
    };
};

export const useFloorsByHostel = (hostelId: string) => {
    return useQuery({
        queryKey: ['floors-by-hostel', hostelId],
        queryFn: () => getFloorsByHostel(Number(hostelId)),
        enabled: !!hostelId && hostelId !== '0',
        select: (data) => data?.data?.floor_list || [],
        staleTime: 0 // Always fetch fresh to act as dropdown dependency
    });
};

export const useRoomCategoryByHostel = (hostelId: string) => {
    return useQuery({
        queryKey: ['room-categories-by-hostel', hostelId],
        queryFn: () => getRoomCategoryByHostel(Number(hostelId)),
        enabled: !!hostelId && hostelId !== '0',
        select: (data) => data?.data?.room_catlist || [],
        staleTime: 0
    });
};
