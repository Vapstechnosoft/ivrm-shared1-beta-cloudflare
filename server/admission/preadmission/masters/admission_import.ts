'use server';

import { api } from '@/lib/apiService';

export async function checkImportValidation(data: any) {
    const url = '/AdmissionImport/checkvalidation';
    return await api.post<any>('admission', url, data);
}

export async function saveImportedData(data: any) {
    const url = '/AdmissionImport/savedata';
    return await api.post<any>('admission', url, data);
}
