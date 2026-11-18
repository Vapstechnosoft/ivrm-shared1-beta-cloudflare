export interface MateralDocument {
    id?: string;
    cfilepath?: string;
    cfilename?: string;
    filetype?: string;
    document_Pathnew?: string;
    cfiledesc?: string;
}

export interface MobileList {
    id?: string;
    hrmemnO_MobileNo?: string;
}

export interface EmailList {
    id?: string;
    hrmeM_EmailId?: string;
}

export interface RoleList {
    ivrmrT_Id: number;
    ivrmrT_Role: string;
    empck?: boolean;
}

export interface ParameterList {
    ismP_ID: number;
    ismP_NAME: string;
    select?: boolean;
}

export interface InstitutionModule {
    ivrmiM_Id: number;
    ivrmM_ModuleName: string;
    Selected?: boolean;
}

export interface InstitutionPage {
    ivrmimP_Id: number;
    ivrmmP_PageName: string;
    Selected?: boolean;
}

export interface PageWiseHeader {
    ivrmhE_Id: number;
    ivrmhE_Name: string;
}

export interface EmailTemplate {
    ismhtmL_Id: number;
    ismhtmL_HTMLName: string;
    ismhtmL_HTMLTemplate?: string;
    Selected?: boolean;
}

export interface SmsEmailSettingList {
    iseS_Id: number;
    ivrmiM_Id: number;
    ivrmimP_Id: number;
    ismhtmL_Id?: number;
    iseS_Template_Name: string;
    iseS_SMSMessage: string;
    iseS_SMSActiveFlag: boolean;
    iseS_MailSubject: string;
    iseS_MailBody?: string;
    iseS_MailFooter: string;
    iseS_Mail_Message?: string;
    iseS_MailHTMLTemplate?: string;
    iseS_MailActiveFlag: boolean;
    iseS_EnableSMSCCFlg: boolean;
    iseS_EnableMailCCFlg: boolean;
    iseS_EnableMailBCCFlg: boolean;
    iseS_SMSCCMobileNo?: string;
    iseS_MailCCId?: string;
    iseS_MailBCCId?: string;
    iseS_AlertBeforeDays?: string;
    iseS_IVRSTextMsg?: string;
    iseS_PNMessage?: string;
    iseS_TemplateId?: string;
    iseS_PNActiveFlg?: boolean;
    iseS_IVRSVoiceFile?: string;
}

export interface SmsMailSettingInitialData {
    emailSmsSettingList: SmsEmailSettingList[];
    institutionModuleList: InstitutionModule[];
    rolelist: RoleList[];
    institutionPageList: InstitutionPage[];
    emailtemplatelist: EmailTemplate[];
    count: number;
}

export interface SmsMailSettingDetailsResponse {
    ivrmhE_Id: number;
    ismhtmL_Id: number;
    emailSmsSettingList: SmsEmailSettingList[];
    pageWiseHeaderList: PageWiseHeader[];
    parameterList: ParameterList[];
    mobilenolist: string[];
    emailistmcc: string[];
    emailistbcc: string[];
    rolelist: RoleList[];
    editfiles: MateralDocument[];
    institutionPageList?: InstitutionPage[];
    templname?: string;
}

export interface SmsMailSettingSavePayload {
    ISES_Id?: number;
    IVRMIM_Id: number;
    IVRMIMP_Id: number;
    ISES_Template_Name: number | string;
    ISES_SMSMessage: string;
    ISES_SMSActiveFlag: boolean;
    ISES_MailSubject: string;
    ISES_MailHTMLTemplate?: string;
    ISES_MailFooter: string;
    ISES_MailActiveFlag: boolean;
    ISES_EnableSMSCCFlg: boolean;
    ISES_AlertBeforeDays?: string;
    ISMHTML_Id?: number;
    ISES_EnableMailCCFlg: boolean;
    ISES_EnableMailBCCFlg: boolean;
    ISES_PNActiveFlg: boolean;
    ISES_PNMessage?: string;
    ISES_IVRSTextMsg?: string;
    ISES_IVRSVoiceFile?: string;
    filelist?: MateralDocument[];
    mobile_list_dto?: MobileList[];
    email_list_dto?: EmailList[];
    email_list_dtocc?: EmailList[];
    roleids?: RoleList[];
    ISES_TemplateId?: string;
}

export interface GenericResponse {
    returnval: boolean;
    message: string;
    success?: boolean;
}
