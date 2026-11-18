'use client';

import { getFloorList } from '@/server/hostel/hostel-management/masters/floor';
import type { ApiSearchparams } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useMasterFloor = (searchParams?: ApiSearchparams) => {
    return useQuery({
        queryKey: ['master-floor', searchParams],
        queryFn: () => getFloorList(searchParams),
        staleTime: 5 * 60 * 1000
    });
};
