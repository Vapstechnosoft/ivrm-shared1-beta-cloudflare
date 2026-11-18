import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import { getMasterInstDocument } from '@/server/admission/AI/masterInstDocument';
import type { ApiSearchparams } from '@/types';
import { useQuery } from '@tanstack/react-query';

export function useMasterInstDocument(searchParams?: ApiSearchparams) {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.MASTER_INST_DOCUMENT, searchParams ?? {}],
        queryFn: () => getMasterInstDocument(searchParams),
        staleTime: 0
    });
}
