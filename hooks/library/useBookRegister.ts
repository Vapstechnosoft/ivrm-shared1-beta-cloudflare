'use client';

import {
    deactivateBookRegister,
    getAuthorDropdown,
    getBookRegisterList,
    getCategoryDropdown,
    getDepartmentDropdown,
    getInitialData,
    getLanguageDropdown,
    getLibraryDropdown,
    getPublisherDropdown,
    getRackDropdown,
    getSubjectDropdown,
    getVendorDropdown,
    saveBookRegister,
    saveBookRegisterTable1,
    saveBookRegisterTable2,
    saveBookRegisterTable3
} from '@/server/library/masters/bookRegister';
import type { ApiSearchparams } from '@/types';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const LIBRARY_QUERY_KEYS = {
    BOOK_REGISTER: 'BOOK_REGISTER',
    BOOK_REGISTER_INITIAL: 'BOOK_REGISTER_INITIAL',
    BOOK_REGISTER_CATEGORY: 'BOOK_REGISTER_CATEGORY',
    BOOK_REGISTER_DEPARTMENT: 'BOOK_REGISTER_DEPARTMENT',
    BOOK_REGISTER_SUBJECT: 'BOOK_REGISTER_SUBJECT',
    BOOK_REGISTER_LIBRARY: 'BOOK_REGISTER_LIBRARY',
    BOOK_REGISTER_VENDOR: 'BOOK_REGISTER_VENDOR',
    BOOK_REGISTER_PUBLISHER: 'BOOK_REGISTER_PUBLISHER',
    BOOK_REGISTER_AUTHOR: 'BOOK_REGISTER_AUTHOR',
    BOOK_REGISTER_RACK: 'BOOK_REGISTER_RACK',
    BOOK_REGISTER_LANGUAGE: 'BOOK_REGISTER_LANGUAGE'
};

export function useBookRegister(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER, searchParams ?? {}],
            queryFn: async () => getBookRegisterList(searchParams),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER]
            });
        },
        saveMutation: useMutation({
            mutationFn: (data: BookRegisterPayload) => saveBookRegister(data),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER]
                });
            }
        }),
        saveTable1Mutation: useMutation({
            mutationFn: (data: BookRegisterPayload) => saveBookRegisterTable1(data),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER]
                });
            }
        }),
        saveTable2Mutation: useMutation({
            mutationFn: (data: BookRegisterPayload) => saveBookRegisterTable2(data),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER]
                });
            }
        }),
        saveTable3Mutation: useMutation({
            mutationFn: (data: BookRegisterPayload) => saveBookRegisterTable3(data),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER]
                });
            }
        }),
        deactivateMutation: useMutation({
            mutationFn: (data: { LMBANO_Id?: number; LMB_Id?: number; LMB_BookTitle?: string; returnval?: boolean; [key: string]: any }) => deactivateBookRegister(data),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER]
                });
            }
        })
    };
}

export function useBookRegisterInitialData() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_INITIAL],
        queryFn: async () => getInitialData(),
        staleTime: 0
    });
}

export function useCategoryDropdown() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_CATEGORY],
        queryFn: async () => getCategoryDropdown(),
        staleTime: 5 * 60 * 1000
    });
}

export function useDepartmentDropdown() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_DEPARTMENT],
        queryFn: async () => getDepartmentDropdown(),
        staleTime: 5 * 60 * 1000
    });
}

export function useSubjectDropdown() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_SUBJECT],
        queryFn: async () => getSubjectDropdown(),
        staleTime: 5 * 60 * 1000
    });
}

export function useLibraryDropdown() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_LIBRARY],
        queryFn: async () => getLibraryDropdown(),
        staleTime: 5 * 60 * 1000
    });
}

export function useVendorDropdown() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_VENDOR],
        queryFn: async () => getVendorDropdown(),
        staleTime: 5 * 60 * 1000
    });
}

export function usePublisherDropdown() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_PUBLISHER],
        queryFn: async () => getPublisherDropdown(),
        staleTime: 5 * 60 * 1000
    });
}

export function useAuthorDropdown() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_AUTHOR],
        queryFn: async () => getAuthorDropdown(),
        staleTime: 5 * 60 * 1000
    });
}

export function useRackDropdown() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_RACK],
        queryFn: async () => getRackDropdown(),
        staleTime: 5 * 60 * 1000
    });
}

export function useLanguageDropdown() {
    return useQuery({
        queryKey: [LIBRARY_QUERY_KEYS.BOOK_REGISTER_LANGUAGE],
        queryFn: async () => getLanguageDropdown(),
        staleTime: 5 * 60 * 1000
    });
}

