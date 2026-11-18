export interface IHomeWorkReport {
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

export interface IHomeWorkAttachment {
    ihwatT_FileName: string;
    ihwatT_Attachment: string;
    ihW_Attachment: string | null;
}

export interface IHomeWorkReportPayload {
    fromdate: string;
    todate: string;
    classarray: { asmcL_Id: number }[] | undefined;
}

export interface IHomeWorkReportResponse {
    report: IHomeWorkReport[];
    detailedReport?: any[];
    consolidatedReport?: any[];
}

export type IHomeWorkAttachmentResponse = IHomeWorkAttachment[];

export interface IHomeWorkInitialData {
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

export interface IHomeWorkDetails {
    IHW_Id?: number;
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ISMS_SubjectName: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    IHW_Topic: string;
    IHW_Date: string;
    FilesCount: number;
    IHW_FilePath: string | null;
    IHW_Attachment: string | null;
    IHW_Assignment: string | null;
    IHW_ActiveFlag: boolean;
}

export interface IHomeWorkUploadReport {
    ihW_Id: number;
    topic: string;
    className: string;
    sectionName: string;
    subjectName: string;
    uploadDate: string;
    employeeName: string;
}
