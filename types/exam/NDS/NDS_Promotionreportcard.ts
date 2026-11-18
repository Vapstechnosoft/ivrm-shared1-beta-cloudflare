export interface NDSPromotionReportPayload {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    Temp_AmstIds: { amsT_Id: number }[];
    flag: string;
}

export interface NDSPromotionReportResponse {
    getinstitution: any[];
    getstudentdetails: any[];
    getpromotionremarksdetails: any[];
    getmarksdetails: any[];
    getexamdetails: any[];
}

export interface ClassListResponse {
    success: boolean;
    getclasslist: { asmcL_Id: number; asmcL_ClassName: string }[];
}

export interface SectionListResponse {
    success: boolean;
    getsectionlist: { asmS_Id: number; asmC_SectionName: string }[];
}

export interface StudentListResponse {
    success: boolean;
    getstudentlist: { amsT_Id: number; studentname: string }[];
}

export interface NDSPromotionReportData {
    success: boolean;
    data: NDSPromotionReportResponse;
    message?: string;
}
