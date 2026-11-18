'use client';

import { getRoomCategoryList } from '@/server/hostel/hostel-management/masters/room-category';
import type { ApiSearchparams } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useMasterRoomCategory = (searchParams?: ApiSearchparams) => {
    return useQuery({
        queryKey: ['master-room-category', searchParams],
        queryFn: () => getRoomCategoryList(searchParams),
        staleTime: 5 * 60 * 1000
    });
};
