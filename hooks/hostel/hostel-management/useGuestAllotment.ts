import { HOSTEL_QUERY_KEYS } from '@/constants/query-keys';
import { getGuestAllotmentLoadData } from '@/server/hostel/hostel-management/transactions/guest-allotment';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useGuestAllotments = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [HOSTEL_QUERY_KEYS.HOSTEL_GUEST_ALLOTMENT_LIST, searchParams ?? {}],
            queryFn: async () => getGuestAllotmentLoadData(searchParams),
            staleTime: 0
        }),

        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [HOSTEL_QUERY_KEYS.HOSTEL_GUEST_ALLOTMENT_LIST]
            });
        }
    };
};
