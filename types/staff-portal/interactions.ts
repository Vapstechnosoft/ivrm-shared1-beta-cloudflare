export interface IInteractionRoleConfig {
    ivrmgC_EnableSTIntFlg?: boolean;
    ivrmgC_EnableCTIntFlg?: boolean;
    ivrmgC_EnableHODIntFlg?: boolean;
    ivrmgC_EnablePrincipalIntFlg?: boolean;
    ivrmgC_EnableASIntFlg?: boolean;
    ivrmgC_EnableECIntFlg?: boolean;
    ivrmgC_EnableSTSUBTIntFlg?: boolean; // STforStudent
    ivrmgC_EnableSTCTIntFlg?: boolean; // CTforStudent
    ivrmgC_EnableSTHODIntFlg?: boolean; // HODforStudent
    ivrmgC_EnableSTPrincipalIntFlg?: boolean; // PRPLforStudent
    ivrmgC_EnableSTASIntFlg?: boolean; // ASforStudent
    ivrmgC_EnableSTECIntFlg?: boolean; // ExCoforStudent
    ivrmgC_EnableStaffwiseIntFlg?: boolean; // STFtoSTF
    ivrmgC_EnableCTSTIntFlg?: boolean; // CLTtoSTU
    ivrmgC_EnableHODSTIntFlg?: boolean; // HODtoSTU
    ivrmgC_EnablePrincipalSTIntFlg?: boolean; // PRItoSTU
    ivrmgC_EnableASSTIntFlg?: boolean; // ACStoSTU
    ivrmgC_EnableECSTIntFlg?: boolean; // ECtoSTU
    ivrmgC_EnableSUBTSTUIntFlg?: boolean; // SUBTtoSTU
    ivrmgC_GMRDTOALLFlg?: boolean; // Groupview
}

export interface IMessage {
    ISMINT_Id: number;
    ISTINT_Id: number;
    ISMINT_InteractionId: string | null;
    ISMINT_Subject: string;
    ISMINT_Interaction: string;
    ISTINT_Interaction?: string;
    ISMINT_GroupOrIndFlg: string;
    ISMINT_ComposedByFlg: string;
    ISTINT_ToFlg: string;
    ISTINT_ToId: number;
    ISMINT_ComposedById: number;
    Sender: string;
    sender_filepath?: string;
    role?: string;
    Receiver: string;
    Receiver_filepath?: string;
    ISMINT_DateTime: string;
    ISTINT_DateTime: string;
    ISTINT_Attachment?: string;
    ISMINT_Attachment?: string;
    ISMINT_ActiveFlag: number;
    ISTINT_ReadFlg?: number;
    Classname: string | null;
    Sectionname: string | null;
    filetype2?: string;
    AMST_AdmNo?: string | null;
}

export interface IRecipient {
    AMST_Id?: number;
    AMST_Id_chk?: boolean;
    AMST_AdmNo?: string;
    studentName?: string;
    EmpName?: string;
    HRME_Id?: number;
    HRME_Id_chk?: boolean;
    HRME_EmployeeCode?: string;
    ISMS_SubjectName?: string;
    tck?: boolean;
    stuck?: boolean;
    Selected?: boolean;
    ASMCL_ClassName?: string;
    ASMC_SectionName?: string;
}

export interface IFeedbackOption {
    fmoP_Id: number;
    fmoP_FeedbackOptions: string;
    fmoP_OptionsValue: string;
    fmtY_Id: number;
    fmqE_Id: number;
}

export interface IFeedbackQuestion {
    fmqE_Id: number;
    fmtY_Id: number;
    fmqE_FeedbackQuestions: string;
    fmtY_FeedbackTypeName: string;
    feedbackoptiondata: IFeedbackOption[];
    name?: number; // Selected fmoP_Id
    fsttR_FeedBack?: string;
}

export interface IInteractionsInitialData {
    roletype?: Array<{ ivrmrT_Role: string }>;
    rolename?: string;
    configflag?: IInteractionRoleConfig[];
    getinboxmsg?: IMessage[];
    getinboxmsg_readflg?: Array<{ ISMINT_Id: number; ISTINT_ReadFlg: number }>;
    result?: IMessage[];
    result1?: Array<{ ISMINT_Id: number; ISTINT_ReadFlg: number }>;
    userhrmE_Id?: number;
    blockstudent?: Array<{ IBINTSTD_BlockedFlg: boolean }>;
    classteacherlist?: any[];
    subteacherlist?: any[];
    typelist?: Array<{ ihoD_Flg: string }>;
    allacademicyear: Array<{
        asmaY_Id: number;
        asmaY_Year: string;
        asmaY_ActiveFlag: number;
        asmaY_Order: number;
        is_Active: boolean;
    }>;
    allSections: Array<{
        asmS_Id: number;
        asmC_SectionName: string;
        asmC_ActiveFlag: number;
        asmC_Order: number;
    }>;
    allClasses: Array<{
        asmcL_Id: number;
        asmcL_ClassName: string;
        asmcL_ActiveFlag: boolean;
        asmcL_Order: number;
    }>;
    chatwithstudent?: boolean;
    chatwithstaff?: boolean;
}

export interface IThreadResponse {
    viewmessage?: any[];
    replylist?: any[];
    createdby?: any[];
    rolename: string;
    typelistrole?: Array<{ ivrmrT_Role: string }>;
    typelist?: Array<{ ihoD_Flg: string }>;
    classteacherlist?: any[];
    subteacherlist?: any[];
    isminT_ComposedByFlg?: string;
    composeedto?: string;
    returnval?: boolean;
}

export interface ITransNumConfig {
    imN_AutoManualFlag?: string;
    imN_Flag?: string;
    mi_Id?: number;
    asmaY_Id?: number;
    IMN_AutoManualFlag?: string;
    IMN_DuplicatesFlag?: string;
    IMN_Flag?: string;
    IMN_PrefixAcadYearCode?: boolean;
    IMN_PrefixParticular?: string;
    IMN_SuffixAcadYearCode?: boolean;
    IMN_SuffixParticular?: string;
    IMN_WidthNumeric?: string;
    IMN_ZeroPrefixFlag?: string;
    IMN_RestartNumFlag?: string;
    ASMAY_Id?: number;
}

export interface IFILESLISTdata {
    ISMID_Filename: string;
    ISMID_Filepath: string;
}

export interface ISaveInteractionRequest {
    roleflg: string;
    userflag: string;
    HRME_Id?: number;
    istint_ToId?: number;
    ismint_ComposedByFlg?: string;
    ismint_GroupOrIndFlg: string;
    ismint_Subject: string;
    ismint_Interaction: string;
    ismint_Attachment?: string;
    ismint_MACAddress?: string;
    ismint_ISPIPAddress?: string;
    ismint_Id?: number;
    images_paths?: any[];
    arrayStudent?: any[];
    student_Id?: number;
    arrayTeachers?: any[];
    employee_Id?: number;
    ASMAY_Id?: number;
    transnumbconfigurationsettingsss?: ITransNumConfig;
}

export interface ISaveInteractionDataRequest {
    ISMINT_GroupOrIndFlg: string;
    ISMINT_Subject: string;
    ISMINT_Interaction: string;
    ISMINT_MACAddress: string;
    ISMINT_ISPIPAddress: string;
    userflag: string;
    roleflg?: string;
    transnumbconfigurationsettingsss: ITransNumConfig;
    arrayStudent?: Array<{ AMST_Id: number }>;
    arrayTeachers?: Array<{ HRME_Id: number }>;
    ISTINT_ToId: number;
    FILESLISTdata?: IFILESLISTdata[];
    images_paths?: string[];
}

export interface ISaveReplyRequest {
    ismint_Id: number;
    istint_Interaction: string;
    images_paths?: string[];
    ismint_MACAddress?: string;
    ismint_ISPIPAddress?: string;
    roleflg?: string;
    istint_ComposedByFlg?: string;
    istint_Id?: number;
}

export interface ISaveReplyDataRequest {
    ISMINT_Id: number;
    ISTINT_Interaction: string;
    ISTINT_MACAddress: string;
    ISMINT_ISPIPAddress: string;
    images_paths?: string[];
    FILESLISTdata?: IFILESLISTdata[];
}
