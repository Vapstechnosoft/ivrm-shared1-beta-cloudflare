export interface IClassWorkReport {
    Id: number;
    Topic: string;
    ClassName: string;
    SectionName: string;
    SubjectName: string;
    FileName: string | null;
    Filepath: string | null;
    UploadDate: string;
    EmployeeName: string;
    UserName: string;
}

export interface IClassWorkDetails {
    icW_Id: number;
    isms_SubjectName: string;
    icW_Topic: string;
    icW_SubTopic: string;
    icW_Content: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    icW_FromDate: string;
    icW_ToDate: string;
    icW_ActiveFlag: boolean;
    createdDate?: string;
    createdTime?: string;
    filesCount?: number;
    icW_Attachment?: string;
    icW_FilePath?: string;
    icW_FilePath_Array?: any[];
    icW_Attachment_Array?: any[];
    attachementlist?: any[];
}

export interface IClassWorkAttachment {
    icwatT_FileName: string;
    icwatT_Attachment: string;
    icW_Attachment: string | null;
}

export interface IClassWorkReportPayload {
    fromdate: string;
    todate: string;
    classarray: { asmcL_Id: number }[] | undefined;
}

export interface IClassWorkInitialData {
    classes: {
        ASMCL_Id: number;
        ASMCL_ClassName: string;
        ASMAY_Id: number | null;
    }[];
    academicYear: {
        asmaY_Id: number;
        asmaY_Year: string;
        asmaY_From_Date: string;
        asmaY_To_Date: string;
    }[];
}

export interface IClassWorkReportResponse {
    report: IClassWorkReport[];
    detailedReport?: any[];
    consolidatedReport?: any[];
}

export type IClassWorkAttachmentResponse = IClassWorkAttachment[];

export interface IUploadClassDropdownList {
    asmcL_Id: number;
    asmcL_ClassName: string;
}
