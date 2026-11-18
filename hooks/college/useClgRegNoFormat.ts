import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import { getClgRegNoFormatInitialData, saveClgRegNoFormat } from '@/server/college/CollegeAdmission/Standarad/clg-reg-no-format';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useClgRegNoFormat = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [COLLEGE_QUERY_KEYS.CLG_REG_NO_FORMAT],
            queryFn: async () => getClgRegNoFormatInitialData(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.CLG_REG_NO_FORMAT]
            });
        }
    };
};

export const useSaveClgRegNoFormat = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => saveClgRegNoFormat(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [COLLEGE_QUERY_KEYS.CLG_REG_NO_FORMAT]
            });
        }
    });
};
