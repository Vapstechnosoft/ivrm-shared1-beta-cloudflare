export interface NDS9ReportPayload {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    Temp_AmstIds: { amsT_Id: number }[];
}

export interface NDS9ReportResponse {
    getstudentmarksdetails: any[];
    gettermdetails: any[];
    getgroupdetails: any[];
    getgroupexamdetails: any[];
    getstudentdetails: any[];
    getstudentwisesubjectlist: any[];
    getstudentwiseskillslist: any[];
    getstudentwiseactiviteslist: any[];
    getpromotionremarksdetails: any[];
}

export interface NDS15ReportResponse {
    getstudentmarksdetails: any[];
    gettermdetails: any[];
    gettermexamdetails: any[];
    getgroupdetails: any[];
    getgroupexamdetails: any[];
    getstudentdetails: any[];
    getstudentwisesubjectlist: any[];
    getstudentwiseskillslist: any[];
    getstudentwiseactiviteslist: any[];
    getstudentwiseattendancedetails: any[];
    getstudentwisesportsdetails: any[];
    getsudentwisehousedetails: any[];
    getsubjectwisetotaldetails: any[];
    getpromotionremarksdetails: any[];
    examwiseremarks: any[];
    getparticipatedetails: any[];
}

export interface NDS15ReportData {
    success: boolean;
    data: NDS15ReportResponse;
    message?: string;
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

export interface NDS9ReportData {
    success: boolean;
    data: NDS9ReportResponse;
    message?: string;
}
