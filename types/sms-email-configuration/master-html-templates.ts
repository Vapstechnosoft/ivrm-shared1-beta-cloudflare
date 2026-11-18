export interface MasterHtmlTemplate {
    ismhtmL_Id: number;
    ismhtmL_HTMLName: string;
    ismhtmL_HTMLTemplate: string;
    ismhtmL_ActiveFlg: boolean;
}

export interface HtmlParameter {
    ismP_ID: number;
    ismP_NAME: string;
}

export interface HtmlTemplatePayload {
    ismhtmL_Id: number;
    ismhtmL_HTMLName: string;
    ismhtmL_HTMLTemplate: string;
}

export interface HtmlTemplateEditData {
    ismhtmL_Id: number;
    ismhtmL_HTMLName: string;
    ismhtmL_HTMLTemplate: string;
}

export interface HtmlTemplateDataResponse {
    parameterlist: MasterHtmlTemplate[];
    parms: HtmlParameter[];
    message?: string;
}

export type HtmlTemplateEditResponse = HtmlTemplateEditData[];

export interface SaveHtmlTemplateResponse {
    success?: boolean;
    returnval?: boolean;
    message?: string;
    data?: any;
}

export interface DeleteHtmlTemplateResponse {
    success: boolean;
    message?: string;
    data?: any;
}
