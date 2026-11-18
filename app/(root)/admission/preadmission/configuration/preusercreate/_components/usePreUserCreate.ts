import { getPreUserInitialData } from '@/server/admission/preadmission/configuration/pre_user_create';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const usePreUserInitialDataQuery = (miId: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: ['PRE_USER_INITIAL_DATA', miId],
            queryFn: async () => getPreUserInitialData(miId),
            staleTime: 0,
            enabled: !!miId
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['PRE_USER_INITIAL_DATA']
            });
        }
    };
};
