'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

// Get Full Complexity Data
export async function getMasterComplexityFullData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterComplexityFacade?${urlParams}`;
    return await api.get<any>('naac', url);
}

// Save or Update Complexity details
export async function saveMasterComplexity(data: any) {
    const url = '/MasterComplexityFacade';
    return await api.post<any>('naac', url, data);
}

// Toggle Complexity status (Activate / Deactivate)
export async function toggleMasterComplexity(complexityId: number) {
    const url = `/MasterComplexityFacade/toggle/${complexityId}`;
    return await api.put<any>('naac', url, {});
}

// Delete Complexity
export async function deleteMasterComplexity(complexityId: number) {
    const url = `/MasterComplexityFacade/delete/${complexityId}`;
    return await api.delete<any>('naac', url);
}
