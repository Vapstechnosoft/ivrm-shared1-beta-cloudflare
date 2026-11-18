import {
    getAlexanderTcChangeClass,
    getAlexanderTcChangeSection,
    getAlexanderTcChangeYear,
    getAlexanderTcDetails,
    getAlexanderTcLoadData
} from '@/server/admission/preadmission/reports/alexander_tc';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useAlexanderTcLoadData = () => {
    return useQuery({
        queryKey: ['alexanderTcLoadData'],
        queryFn: async () => {
            return await getAlexanderTcLoadData();
        }
    });
};

export const useAlexanderTcChangeYear = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            return await getAlexanderTcChangeYear(data);
        }
    });
};

export const useAlexanderTcChangeClass = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            return await getAlexanderTcChangeClass(data);
        }
    });
};

export const useAlexanderTcChangeSection = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            return await getAlexanderTcChangeSection(data);
        }
    });
};

export const useAlexanderTcDetails = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            return await getAlexanderTcDetails(data);
        }
    });
};
