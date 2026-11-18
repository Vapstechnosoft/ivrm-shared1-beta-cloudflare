import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getAdmissionFormDetails,
    getAllAdmissionLists,
    getStudentAdmissionFormById,
    getStudentProfileView
} from '@/server/admission/admission-form/admission';

import type { IadmissionFormDetails } from '@/types/admission/admission';
import { type UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiSearchparams } from '@/types';

export const useGetAllAdmissionLists = (asmaY_Id: number,searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_FORM_GET_ALL,asmaY_Id, searchParams ?? {}],
            queryFn: async () => getAllAdmissionLists(asmaY_Id,searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_FORM_GET_ALL]
            });
        }
    };
};

export const useStudentAdmissionFormById = (amstId: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDENT_ADMISSION_FORM, amstId],
            queryFn: async () => getStudentAdmissionFormById(amstId),
            staleTime: 0,
            enabled: !!amstId
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDENT_ADMISSION_FORM]
            });
        }
    };
};

export const useStudentProfileView = (amstId: number, asmclId: number, asmsId: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [ADMISSION_QUERY_KEYS.STUDENT_ADMISSION_FORM, 'profile', amstId, asmclId, asmsId],
            queryFn: async () => getStudentProfileView(amstId, asmclId, asmsId),
            staleTime: 0,
            enabled: !!amstId
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.STUDENT_ADMISSION_FORM, 'profile']
            });
        }
    };
};

export const useAdmissionFormDetails = (): UseQueryResult<IadmissionFormDetails> & { refetchAll: () => void } => {
    const queryClient = useQueryClient();
    const query = useQuery<IadmissionFormDetails>({
        queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_FORM_DETAILS],
        queryFn: async () => {
            const response = await getAdmissionFormDetails();
            return response.data as IadmissionFormDetails;
        },
        staleTime: 0
    });

    return {
        ...query,
        refetchAll: () => {
            queryClient.invalidateQueries({
                queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_FORM_DETAILS]
            });
        }
    } as any;
};

import { getCasteByCasteCategoryApi, onchangeclassApi, onchangestreamApi } from '@/server/admission/admission-form/admission';

export const useOnChangeClass = (classId: number, asmayId: number) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_FORM_ONCHANGE_CLASS, classId, asmayId],
        queryFn: async () => onchangeclassApi({ ASMCL_Id: classId, ASMAY_Id: asmayId }),
        enabled: !!classId,
        staleTime: 0
    });
};

export const useOnChangeStream = (streamId: number) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_FORM_ONCHANGE_STREAM, streamId],
        queryFn: async () => onchangestreamApi({ ASMST_Id: streamId }),
        enabled: !!streamId,
        staleTime: 0
    });
};

export const useGetCasteByCasteCategory = (imccId: number) => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.ADMISSION_FORM_CASTE_BY_CATEGORY, imccId],
        queryFn: async () => {
            const response = await getCasteByCasteCategoryApi(imccId);
            return response.data;
        },
        enabled: !!imccId,
        staleTime: 0
    });
};
