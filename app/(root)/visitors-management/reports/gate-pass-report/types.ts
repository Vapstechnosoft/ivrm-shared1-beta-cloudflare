export interface MonthItem {
    monthid: number;
    monthname: string;
}

export interface GatePassReportInitialData {
    month_list?: MonthItem[];
    [key: string]: any;
}

export interface StudentGatePassRecord {
    amsT_AdmNo: string;
    amsT_FirstName: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    amsT_MobileNo: number | string;
    gphS_GatePassNo: string;
    gphS_IDCardNo: string;
    gphS_DateTime: string;
    gphS_Remarks: string;
    [key: string]: any;
}

export interface EmployeeGatePassRecord {
    hrmE_EmployeeCode: string;
    hrmE_EmployeeFirstName: string;
    hrmD_DepartmentName: string;
    hrmdeS_DesignationName: string;
    hrmE_MobileNo: number | string;
    gphsT_GatePassNo: string;
    gphsT_IDCardNo: string;
    gphsT_DateTime: string;
    gphsT_Remarks: string;
    [key: string]: any;
}

export interface GatePassReportFilterPayload {
    radiotype: 'std' | 'emp';
    all1: '1' | '0'; // '1' = Between Days, '0' = Month Wise
    fromdate?: string;
    todate?: string;
    month_id?: string;
}

export interface GatePassReportResponse {
    viewlist?: (StudentGatePassRecord | EmployeeGatePassRecord)[];
    yarname?: { asmaY_Year: string }[];
    [key: string]: any;
}
