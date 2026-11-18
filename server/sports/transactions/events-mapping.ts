'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { IEventMappingDTO } from '@/types/sports/transactions/events-mapping';

export async function getEventMappingDetails(params: any = {}) {
    const search_query = (params.search_query || '').toString().trim();
    const resultParams = {
        ...params,
        search_query,
        search_column: params.search_columns || ''
    };
    const urlParams = getSearchParamsUrl(resultParams);
    const url = `/EventVenueMapping/getDetails?${urlParams}`;
    // Change back to get since backend returned 405 for POST
    const response = await api.get<any>('sports', url);

    if (response.success && response.data) {
        const data = response.data as any;
        // Map according to user's snippet
        const records = data.eventmappingList || data.list || [];

        return {
            ...response,
            data: {
                ...data,
                records, // table expects records
                total: response.total || 0
            }
        };
    }
    return response;
}

export async function saveEventMapping(data: IEventMappingDTO) {
    const url = '/EventVenueMapping/save';
    return await api.post<any>('sports', url, data);
}

export async function editEventMapping(data: { ASMAY_Id: number; SPCCE_Id: number }) {
    const url = `/EventVenueMapping/EditDetails?ASMAY_Id=${data.ASMAY_Id}&SPCCE_Id=${data.SPCCE_Id}`;
    return await api.post<any>('sports', url, data);
}

export async function deactivateEventMapping(data: { ASMAY_Id: number; SPCCE_Id: number }) {
    const url = `/EventVenueMapping/deactivate?ASMAY_Id=${data.ASMAY_Id}&SPCCE_Id=${data.SPCCE_Id}`;
    return await api.post<any>('sports', url, data);
}

export async function getModelData(data: { ASMAY_Id: number; SPCCE_Id: number }) {
    const url = `/EventVenueMapping/get_modeldata?ASMAY_Id=${data.ASMAY_Id}&SPCCE_Id=${data.SPCCE_Id}`;
    return await api.post<any>('sports', url, data);
}
