'use server';

import { api } from '@/lib/apiService';
import type { IStatusInitialData, IStatusStudent } from '@/types/admission/preadmission/status';

export async function getStatusInitialData() {
    const url = '/Status/getinitialdata';
    return await api.get<IStatusInitialData>('preadmission', url);
}

export async function searchStatusData(data: any) {
    const url = `/Status/getdataonsearchfilter?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&PAMST_Id=${data.PAMST_Id}&status_type=${data.status_type}`;
    return await api.post<IStatusStudent[]>('preadmission', url);
}

export async function saveStatusData(data: any) {
    const url = '/Status/savedata';
    return await api.post<any>('preadmission', url, data);
}

export async function forgotOTPForEmailval(data: any) {
    const url = '/Login/ForgotOTPForEmailval';
    return await api.post<any>('preadmission', url, data);
}

export async function verifyEmailOtpgen(data: any) {
    const url = '/Login/VerifyEmailOtpgen';
    return await api.post<any>('preadmission', url, data);
}
