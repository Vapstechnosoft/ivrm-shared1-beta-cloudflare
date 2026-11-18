'use server';

import { api } from '@/lib/apiService';
import type {
    GenericResponse,
    SmsMailSettingDetailsResponse,
    SmsMailSettingInitialData
} from '@/types/sms-email-configuration/sms-mail-setting';

export async function getSmsMailSettingData(pageId = 2) {
    return await api.get<SmsMailSettingInitialData>('preadmission', `/SMSEmailSetting/getSmsEmailSetting`);
}

export async function getModulePage(moduleId: number) {
    return await api.post<any>('preadmission', `/SMSEmailSetting/getmodulePage?IVRMIM_Id=${moduleId}`);
}

export async function getHeader(ivrmim_id: number, ivrmimp_id: number) {
    return await api.post<any>('preadmission', `/SMSEmailSetting/getHeader?IVRMIM_Id=${ivrmim_id}&IVRMIMP_Id=${ivrmimp_id}`);
}

export async function getParameter(headerId: number) {
    return await api.post<any>('preadmission', `/SMSEmailSetting/parameter?IVRMHE_Id=${headerId}`);
}

export async function saveSmsMailSetting(data: any) {
    return await api.post<GenericResponse>('preadmission', '/SMSEmailSetting/saveEmailSetting', data);
}

export async function deleteSmsMailSetting(id: number) {
    return await api.delete<GenericResponse>('preadmission', `/SMSEmailSetting/deletedetails?ISES_Id=${id}`);
}

export async function getSmsMailSettingDetails(ises_id: number, ivrmimp_id: number) {
    return await api.post<SmsMailSettingDetailsResponse>(
        'preadmission',
        `/SMSEmailSetting/getdetails?ISES_Id=${ises_id}&IVRMIMP_Id=${ivrmimp_id}`
    );
}

export async function toggleSmsActive(id: number) {
    return await api.post<GenericResponse>('preadmission', `/SMSEmailSetting/activedeactivesms?ISES_Id=${id}`);
}

export async function toggleEmailActive(id: number) {
    return await api.post<GenericResponse>('preadmission', `/SMSEmailSetting/activedeactiveemail?ISES_Id=${id}`);
}

export async function viewEmailTemplate(ismhtml_id: number) {
    return await api.post<any>('preadmission', `/SMSEmailSetting/viewtempate?ISMHTML_Id=${ismhtml_id}`);
}
