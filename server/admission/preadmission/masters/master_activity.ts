'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { IMasterActivity } from '@/schemas/admission/preadmission/master_activity';
import type { ApiSearchparams } from '@/types';

/**
 * Get all master activities
 */
export const getMasterActivitiesDetails = async (searchParams?: ApiSearchparams) => {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'amA_Activity');
    const url = `/MasterActivity/GetMasterActivityData?${urlParams}`;
    return await api.get('admission', url);
};

/**
 * Get specific row details for editing
 */
export const getSelectedMasterActivityRow = async (id: number) => {
    const url = `/MasterActivity/GetSelectedRowDetails/${id}`;
    return await api.get('admission', url);
};

/**
 * Save or Update Master Activity
 */
export const addOrUpdateMasterActivity = async (data: IMasterActivity) => {
    const url = '/MasterActivity/MasterActivityData/';
    return await api.post('admission', url, {
        amA_Id: data.amA_Id ?? 0,
        AMA_Activity: data.amA_Activity,
        AMA_Activity_Desc: data.amA_Activity_Desc
    });
};

/**
 * Delete Master Activity
 */
export const deleteMasterActivityData = async (AMA_Id: number) => {
    const url = `/MasterActivity/MasterDeleteModulesDATA/${AMA_Id}`;
    return await api.delete('admission', url);
};
