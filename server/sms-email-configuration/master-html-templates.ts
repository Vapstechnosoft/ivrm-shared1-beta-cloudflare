'use server';

import { api } from '@/lib/apiService';
import type {
    DeleteHtmlTemplateResponse,
    HtmlTemplateDataResponse,
    HtmlTemplateEditResponse,
    HtmlTemplatePayload,
    SaveHtmlTemplateResponse
} from '@/types/sms-email-configuration/master-html-templates';

export async function getHtmlTemplatesData(): Promise<HtmlTemplateDataResponse> {
    const response = await api.get<HtmlTemplateDataResponse>('preadmission', '/MasterSmsEmailParameter/htmlGetdetails');
    return response.data as any;
}

export async function saveHtmlTemplateData(data: HtmlTemplatePayload): Promise<SaveHtmlTemplateResponse> {
    const response = await api.post<SaveHtmlTemplateResponse>('preadmission', '/MasterSmsEmailParameter/htmlSavedata', data);
    return response as any;
}

export async function deleteHtmlTemplateData(data: {
    ismhtmL_Id: number;
    ismhtmL_ActiveFlg: boolean;
}): Promise<DeleteHtmlTemplateResponse> {
    const response = await api.post<DeleteHtmlTemplateResponse>(
        'preadmission',
        `/MasterSmsEmailParameter/htmldeletedata?ISMHTML_Id=${data.ismhtmL_Id}`,
        data
    );
    return response as any;
}

export async function editHtmlTemplateData(data: { ismhtmL_Id: number }): Promise<HtmlTemplateEditResponse> {
    const response = await api.post<HtmlTemplateEditResponse>(
        'preadmission',
        `/MasterSmsEmailParameter/htmledit?ISMHTML_Id=${data.ismhtmL_Id}`
    );
    return response.data as any;
}
