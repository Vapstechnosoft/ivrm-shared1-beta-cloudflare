'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

// --- Interfaces ---

export interface IMess {
    hlmM_Id: number;
    mI_Id?: number;
    hlmM_Name: string;
    hlmM_VegFlg?: boolean;
    hlmM_NonVegFlg?: boolean;
    hlmM_BFSStartTime?: string | null;
    hlmM_BFSEndTime?: string | null;
    hlmM_LNStartTime?: string | null;
    hlmM_LNEndTime?: string | null;
    hlmM_LNTSStartTime?: string | null;
    hlmM_LNTSEndTime?: string | null;
    hlmM_DNSStartTime?: string | null;
    hlmM_DNSEndTime?: string | null;
    hlmM_ActiveFlag?: boolean;
    createdDate?: string;
    updatedDate?: string;
    hlmM_CreatedBy?: number;
    hlmM_UpdatedBy?: number;
}

export interface IMessListResponse {
    get_messlist: IMess[];
    get_messCategorylist: any[];
}

// --- Actions ---

/**
 * Fetch mess list with pagination
 * GET /MasterMess/get_mess_list
 */
export async function fetchMessData(searchParams?: ApiSearchparams): Promise<ApiResponse<IMessListResponse>> {
    try {
        const urlParams = getSearchParamsUrl(searchParams ?? {});
        const url = `/MasterMess/get_mess_list?${urlParams}`;
        const response = await api.get<IMessListResponse>('hostel', url);
        return response;
    } catch (error) {
        console.error('Error fetching mess data:', error);
        return {
            success: false,
            message: 'Failed to fetch mess data',
            data: {
                get_messlist: [],
                get_messCategorylist: []
            }
        };
    }
}

/**
 * Get mess dropdown list
 * GET /MasterMess/mess-dropdown
 */
export async function getMessList(): Promise<ApiResponse<IMess[]>> {
    try {
        const response = await api.get<IMess[]>('hostel', '/MasterMess/mess-dropdown');
        return response;
    } catch (error) {
        console.error('Error fetching mess dropdown:', error);
        return {
            success: false,
            message: 'Failed to fetch mess dropdown',
            data: []
        };
    }
}

/**
 * Save mess (create or update)
 * POST /MasterMess/save_mess
 */
export async function saveMess(data: {
    hlmM_Id?: number;
    hlmM_Name: string;
    hlmM_VegFlg?: boolean;
    hlmM_NonVegFlg?: boolean;
    hlmM_BFSStartTime?: string | null;
    hlmM_BFSEndTime?: string | null;
    hlmM_LNStartTime?: string | null;
    hlmM_LNEndTime?: string | null;
    hlmM_LNTSStartTime?: string | null;
    hlmM_LNTSEndTime?: string | null;
    hlmM_DNSStartTime?: string | null;
    hlmM_DNSEndTime?: string | null;
}): Promise<ApiResponse<null>> {
    try {
        const url = '/MasterMess/save_mess';
        const response = await api.post<null>('hostel', url, data);
        return response;
    } catch (error) {
        console.error('Error saving mess:', error);
        return {
            success: false,
            message: 'Failed to save mess',
            data: null
        };
    }
}

/**
 * Deactivate/Activate mess
 * PUT /MasterMess/deactivate_mess?HLMM_Id={id}
 */
export async function deleteMess(HLMM_Id: number): Promise<ApiResponse<null>> {
    try {
        const url = `/MasterMess/deactivate_mess?HLMM_Id=${HLMM_Id}`;
        const response = await api.put<null>('hostel', url);
        return response;
    } catch (error) {
        console.error('Error toggling mess status:', error);
        return {
            success: false,
            message: 'Failed to toggle mess status',
            data: null
        };
    }
}
