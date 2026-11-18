import {
    generateSchoolTpin,
    getSchoolTpinGenerationInitialDetails,
    searchSchoolTpinGeneration
} from '@/server/admission/hutchings/master/schooltpingeneration';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSchoolTpinGenerationInitialDetails = () => {
    return useQuery({
        queryKey: ['schoolTpinGenerationInitialDetails'],
        queryFn: getSchoolTpinGenerationInitialDetails
    });
};

export const useSearchSchoolTpinGenerationMutation = () => {
    return useMutation({
        mutationFn: searchSchoolTpinGeneration
    });
};

export const useGenerateSchoolTpinMutation = () => {
    return useMutation({
        mutationFn: generateSchoolTpin
    });
};
