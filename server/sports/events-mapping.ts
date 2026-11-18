'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { EventsMappingFormSchema, IEventsMappingData, IEventsMappingDropdowns } from '@/types/sports/events-mapping';

export async function getEventsMappingDropdowns(): Promise<IEventsMappingDropdowns> {
    const url = '/EventVenueMapping/getDetails';
    const response = await api.get<any>('sports', url);
    const data = response.data as any;

    return {
        academicYear: data.academicYear || [],
        eventsList: data.eventsList || [],
        venueList: data.venuelist || [],
        sponsorList: data.sponsorList || []
    };
}

export async function getEventsMappingList(params: any): Promise<ApiResponse<IEventsMappingData[]>> {
    const search_query = (params.search_query || '').toString().trim();
    const resultParams = {
        ...params,
        search_query: search_query,
        search_column: params.search_columns || ''
    };

    const urlParams = getSearchParamsUrl(resultParams);
    const url = `/EventVenueMapping/getDetails?${urlParams}`;
    const response = await api.post<any>('sports', url, {});

    if (response.success && response.data) {
        const data = response.data as any;
        // In the user's C# snippet, the paginated list is actually sent in 'eventmappingList'
        // due to a typo in their code (should have been 'list' but they sent 'eventmappingList')
        const records = data.eventmappingList || data.list || [];

        return {
            success: true,
            message: response.message || 'Data fetched successfully',
            data: records,
            total: response.total || 0,
            page: response.page || 1,
            page_size: response.page_size || 10
        };
    }

    return {
        success: false,
        message: response.message || 'Failed to fetch data',
        data: [],
        total: 0
    };
}

export async function saveEventsMapping(data: EventsMappingFormSchema): Promise<ApiResponse<any>> {
    const url = '/EventVenueMapping/save';
    return await api.post<any>('sports', url, data);
}

export async function deactivateEventsMapping(id: number, activeFlag: boolean): Promise<ApiResponse<any>> {
    // Note: The user's snippet for deactivate in server action used ASMAY_Id and SPCCE_Id
    // But here we need to check how it's called.
    const url = `/EventVenueMapping/deactivate?id=${id}&activeFlag=${activeFlag}`;
    return await api.post<any>('sports', url, {});
}
