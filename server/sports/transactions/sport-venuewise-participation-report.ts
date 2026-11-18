'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import type {
    ISportVenueWiseParticipationReportData,
    ISportVenueWiseParticipationReportPayload
} from '@/types/sports/reports/venue-wise-participation-report';

export async function getInitialData(): Promise<ApiResponse<ISportVenueWiseParticipationReportData>> {
    return await api.post<ISportVenueWiseParticipationReportData>('sports', '/SportVenuewiseParticipationReport/Getdetails', {});
}

export async function getDetails(payload: { asmaY_Id: number }): Promise<ApiResponse<ISportVenueWiseParticipationReportData>> {
    return await api.post<ISportVenueWiseParticipationReportData>('sports', '/SportVenuewiseParticipationReport/get_class', payload);
}

export async function getSections(payload: { asmaY_Id: number; asmcL_Id: number }): Promise<
    ApiResponse<ISportVenueWiseParticipationReportData>
> {
    return await api.post<ISportVenueWiseParticipationReportData>('sports', '/SportVenuewiseParticipationReport/get_section', payload);
}

export async function getStudentData(payload: { asmaY_Id: number; asmcL_Id: number; asmS_Id: number }): Promise<
    ApiResponse<ISportVenueWiseParticipationReportData>
> {
    return await api.post<ISportVenueWiseParticipationReportData>('sports', '/SportVenuewiseParticipationReport/get_student', payload);
}

export async function getReportData(payload: ISportVenueWiseParticipationReportPayload): Promise<ApiResponse<any>> {
    const { page, page_size, search_query, search_column, sort_column, sort_direction, ...dataPayload } = payload;

    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (page_size) queryParams.append('page_size', page_size.toString());
    if (search_query) queryParams.append('search_query', search_query);
    if (search_column) queryParams.append('search_column', search_column);
    if (sort_column) queryParams.append('sort_column', sort_column);
    if (sort_direction) queryParams.append('sort_direction', sort_direction);

    const queryString = queryParams.toString();
    const url = `/SportVenuewiseParticipationReport/showdetails${queryString ? `?${queryString}` : ''}`;

    return await api.post<any>('sports', url, dataPayload);
}
