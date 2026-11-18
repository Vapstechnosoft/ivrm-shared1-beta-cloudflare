'use server';

import { api } from '@/lib/apiService';
import type { IAdmissionStandard, IAdmissionStandardPayload } from '@/types/preconfiguration/admission-standard';

export async function getAdmissionStandardData() {
    const url = '/AdmissionStandard/loaddata';
    return await api.get<IAdmissionStandard[]>('preadmission', url);
}

export async function saveAdmissionStandardData(data: IAdmissionStandardPayload) {
    const url = '/AdmissionStandard/savedata';
    return await api.post<any>('preadmission', url, data);
}
