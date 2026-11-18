'use server';

import { api } from '@/lib/apiService';
import type {
    InstitutionPage,
    MasterHeaderDetailsInitData,
    MasterHeaderDetailsPayload,
    MasterHeaderDetailsSelectedRow
} from '@/types/sms-email-configuration/master-header-details';

export async function getMasterHeaderDetailsData(): Promise<MasterHeaderDetailsInitData> {
    const res = await api.get<MasterHeaderDetailsInitData>('preadmission', '/MasterHeaderDetails/Getdetails');
    return res.data as MasterHeaderDetailsInitData;
}

export async function getModulePage(moduleId: number): Promise<{ institutionPageList: InstitutionPage[] }> {
    const res = await api.post<{ institutionPageList: InstitutionPage[] }>(
        'preadmission',
        `/MasterHeaderDetails/getmodulePage?IVRMIM_Id=${moduleId}`
    );
    return res.data as { institutionPageList: InstitutionPage[] };
}

export async function saveMasterHeaderDetailsData(data: MasterHeaderDetailsPayload): Promise<any> {
    const res = await api.post<any>('preadmission', '/MasterHeaderDetails/SaveData', data);
    return res as any;
}

export async function deleteMasterHeaderDetailsData(IVRMHE_Id: number): Promise<any> {
    const res = await api.post<any>('preadmission', `/MasterHeaderDetails/DeleteEntry?IVRMHE_Id=${IVRMHE_Id}`);
    return res.data;
}

export async function getSelectedRowDetails(IVRMHE_Id: number): Promise<MasterHeaderDetailsSelectedRow> {
    const res = await api.post<MasterHeaderDetailsSelectedRow>(
        'preadmission',
        `/MasterHeaderDetails/GetSelectedRowDetails?IVRMHE_Id=${IVRMHE_Id}`,
        {}
    );
    return res.data as MasterHeaderDetailsSelectedRow;
}
