import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { tableSearchVariables } from '@/lib/data-table.config';
import {
    getInstitutionList,
    getPreAdmissionSetOrder,
    getPreAdmissionYear
} from '@/server/admission/preadmission/configuration/academic_year_master';
import { checkPreadmissionLive } from '@/server/admission/preadmission/configuration/configuration';
import {
    getAcademicYearMasterConfiguration,
    getMasterConfiguration
} from '@/server/admission/preadmission/configuration/master_configuration';
import {
    getMasterNumbering,
    getPreRegistrationNumbering,
    getRegNumbering,
    getRegistrationNumbering
} from '@/server/preconfiguration/transaction-numbering';
import type { ApiSearchparams } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

export const useMasterNumberingDropdown = () => {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.REGISTRATION_NUMBERING, 'MASTER_NUMBERING'],
        queryFn: async () => getMasterNumbering(),
        staleTime: 60000
    });
};

export const useCheckPreadmissionLive = (subDomain: string) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.CHECK_PREADMISSION_LIVE, subDomain],
            queryFn: async () => checkPreadmissionLive(subDomain),
            staleTime: 50000, // 5 seconds
            enabled: !!subDomain
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.CHECK_PREADMISSION_LIVE]
            });
        }
    };
};

export const useMasterConfiguration = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.MASTER_CONFIGURATION, searchParams ?? {}],
            queryFn: async () => getMasterConfiguration(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.MASTER_CONFIGURATION]
            });
        }
    };
};

export const usePreAdmissionAcademicYear = (searchParams?: ApiSearchparams) => {
    const queryClient = useQueryClient();

    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    const [sortBy] = useQueryState(tableSearchVariables.sort_column, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [order] = useQueryState(
        tableSearchVariables.sort_direction,
        parseAsStringLiteral(['asc', 'desc'] as const)
            .withOptions({ shallow: false })
            .withDefault('asc')
    );
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const params: ApiSearchparams = {
        page: searchParams?.page ?? page,
        page_size: searchParams?.page_size ?? pageSize,
        sort_column: searchParams?.sort_column !== undefined ? searchParams.sort_column : sortBy,
        sort_direction: searchParams?.sort_direction !== undefined ? searchParams.sort_direction : order,
        search_query: searchParams?.search_query !== undefined ? searchParams.search_query : searchQuery,
        ...searchParams
    };

    return {
        ...useQuery({
            queryKey: [
                PREADMISSION_QUERY_KEYS.ACADEMIC_YEAR_MASTER,
                params.page,
                params.page_size,
                params.sort_column,
                params.sort_direction,
                params.search_query
            ],
            queryFn: async () => getPreAdmissionYear(params),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.ACADEMIC_YEAR_MASTER]
            });
        }
    };
};

export const usePreAdmissionAcademicYearSetOrder = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.SET_ORDER],
            queryFn: async () => getPreAdmissionSetOrder(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.SET_ORDER]
            });
        }
    };
};
export const useRegistrationNumbering = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.REGISTRATION_NUMBERING],
            queryFn: async () => getRegistrationNumbering(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.REGISTRATION_NUMBERING]
            });
        }
    };
};

export const useRegNumbering = (numberingType: any) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.REGISTRATION_NUMBERING, numberingType],
            queryFn: async () => getRegNumbering(numberingType),
            staleTime: 0,
            enabled: !!numberingType
        }),
        refetchAll: async () => {
            return await queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.REGISTRATION_NUMBERING]
            });
        }
    };
};

export const usePreRegistrationNumbering = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.PRE_REGISTRATION_NUMBERING],
            queryFn: async () => getPreRegistrationNumbering(),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.PRE_REGISTRATION_NUMBERING]
            });
        }
    };
};

export const useAcademicYearMasterConfiguration = (asmayId: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [PREADMISSION_QUERY_KEYS.ACADEMIC_YEAR_MASTER_CONFIGURATION, asmayId],
            queryFn: async () => getAcademicYearMasterConfiguration(asmayId),
            staleTime: 0,
            enabled: !!asmayId
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [PREADMISSION_QUERY_KEYS.ACADEMIC_YEAR_MASTER_CONFIGURATION]
            });
        }
    };
};

export const usePreAdmissionAcademicYearDetails = (asmayId: number, roleId: number) => {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.ACADEMIC_YEAR_MASTER, asmayId, roleId],
        queryFn: async () => getPreAdmissionYear({ ASMAY_Id: asmayId }),
        enabled: !!asmayId && !!roleId
    });
};

export const useInstitutionList = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: ['INSTITUTION_LIST'],
            queryFn: async () => getInstitutionList(),
            staleTime: 60000
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({ queryKey: ['INSTITUTION_LIST'] });
        }
    };
};
