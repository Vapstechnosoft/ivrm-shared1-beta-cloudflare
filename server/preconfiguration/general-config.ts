'use server';

import { api } from '@/lib/apiService';
import type { IGeneralConfigurationResponse } from '@/types/preconfiguration/general-config';

export async function getGeneralConfigurationData() {
    const url = `/GenConfig/Configurationget`;
    const response = await api.get<IGeneralConfigurationResponse>('preadmission', url);
    return response.data as unknown as IGeneralConfigurationResponse;
}

export async function getGeneralConfigurationPageContent(ivrmP_Id: number) {
    const url = `/GenConfig/getcontent?IVRMP_Id=${ivrmP_Id}`;
    return await api.get<any>('preadmission', url);
}

export async function getGeneralConfigurationEditData(id: number) {
    const url = `/GenConfig/geteditdata?IVRMGC_Id=${id}`;
    const response = await api.post<IGeneralConfigurationResponse>('preadmission', url);
    return response.data as unknown as IGeneralConfigurationResponse;
}

export async function saveGeneralConfiguration(data: any) {
    const url = '/GenConfig/savegenConfigData';
    return await api.post<any>('preadmission', url, data);
}

export async function deleteGeneralUsernameConfig(id: number) {
    const url = `/GenConfig/deleteUserNameconfig?IVRMCUNP_Id=${id}`;
    return await api.post<any>('preadmission', url);
}
