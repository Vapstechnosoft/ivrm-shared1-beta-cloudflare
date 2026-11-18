import { getTTCategories } from '@/server/admission/preadmission/newsharedhost/masters/ttcategory';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useTTCategory = () => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: ['ttcategory_list'],
            queryFn: async () => {
                const res = await getTTCategories();
                return res;
            },
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: ['ttcategory_list']
            });
        }
    };
};
