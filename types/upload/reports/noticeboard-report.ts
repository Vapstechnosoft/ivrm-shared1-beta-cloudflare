export interface INoticeBoardReport {
    Id: number;
    Topic: string;
    ClassName: string;
    SectionName: string | null;
    SubjectName: string | null;
    UploadDate: string;
    FileName: string;
    Filepath: string;
    UserName: string | null;
    EmployeeName: string | null;
}

export interface INoticeBoardAttachment {
    intbfL_FileName: string;
    intbfL_FilePath: string;
    intB_Attachment: string | null;
    intB_Id: number;
}

export interface INoticeBoardReportPayload {
    fromdate: string;
    todate: string;
    classarray: { ASMCL_Id: number }[] | undefined;
    ASMAY_Id: number;
}

export interface INoticeBoardReportResponse {
    report: INoticeBoardReport[];
}

export interface INoticeBoardAttachmentResponse {
    attachementlist: INoticeBoardAttachment[];
}

export interface INoticeBoardInitialData {
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
