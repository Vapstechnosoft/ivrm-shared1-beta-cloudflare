'use client';
import { getPositionTypeDropdown } from '@/server/hrms/recruitment/masterDropDown/masterDropDown';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook for Get Position Type List Dropdown
 */

export function usePositionTypeDropdown() {
    return useQuery({
        queryKey: ['position-type-dropdown'],
        queryFn: () => getPositionTypeDropdown(),
        staleTime: 1000 * 60 * 5
    });
}
