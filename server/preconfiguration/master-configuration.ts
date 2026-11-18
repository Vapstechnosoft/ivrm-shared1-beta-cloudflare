'use server';

import { api } from '@/lib/apiService';
import type { IMasterConfigurationResponse } from '@/types/preconfiguration/master-configuration';

export async function getMasterConfigurationData() {
    const url = '/StudentMasterConfiguration/getMasterConfigDrp';
    return await api.get<IMasterConfigurationResponse>('preadmission', url);
}

export async function getMasterConfigurationEditData(id: number) {
    const url = `/StudentMasterConfiguration/getmastereditdata?ISPAC_Id=${id}`;
    return await api.post<IMasterConfigurationResponse>('preadmission', url);
}

export async function saveMasterConfiguration(data: any) {
    const url = `/StudentMasterConfiguration/saveMasterConfigData`;
    return await api.post<any>('preadmission', url, data);
}

export async function deleteMasterConfiguration(id: number) {
    const url = `/StudentMasterConfiguration/deleteMasterconfig?ISPAC_Id=${id}`;
    return await api.post<any>('preadmission', url);
}
