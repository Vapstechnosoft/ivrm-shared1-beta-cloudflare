export interface IRackReportInitialData {
    lib_list: Array<{
        lmaL_Id: number;
        lmaL_LibraryName: string;
    }>;
    racklist: Array<{
        lmrA_Id: number | string;
        lmrA_RackName: string;
        lmrA_FloorName?: string;
    }>;
    booklist?: Array<{
        lmb_Id: number;
        lmb_BookTitle: string;
    }>;
    subjectlist?: Array<{
        lmsU_Id: number;
        lmsU_SubjectName: string;
    }>;
    floorlist?: Array<any>;
}

export interface IRackReportRequest {
    MI_Id?: number;
    LMAL_Id: number;
    LMRA_Id: number | string;
    FromDate?: string;
    ToDate?: string;
    LMB_Id?: number;
    LMSU_Id?: number;
    IssueStatus?: string;
    ReturnStatus?: string;
    [key: string]: any;
}

export interface IRackReportGridData {
    slNo?: number;
    lmbanO_AccessionNo: string;
    lmbano_AccessionNo?: string;
    lmB_BookTitle: string;
    lmb_BookTitle?: string;
    rack_Name: string;
    lmrA_RackName?: string;
    lmra_FloorName: string;
    lmrA_FloorName?: string;
    lmb_BookType: string;
    lmB_BookType?: string;
    rack_Location: string;
    lmbano_AvialableStatus: string;
    lmbanO_AvialableStatus?: string;
    authorName?: string;
    lma_AuthorName?: string;
    lmD_DepartmentName?: string;
    lmP_PublisherName?: string;
    lmS_SubjectName?: string;
    [key: string]: any;
}

export interface IRackReportResponse {
    success?: boolean;
    message?: string;
    data?: IRackReportGridData[];
    reportlist?: IRackReportGridData[];
}
