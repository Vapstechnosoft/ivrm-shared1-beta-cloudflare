export interface MonthItem {
    monthid: number;
    monthname: string;
}

export interface VisitorReportInitialData {
    month_list?: MonthItem[];
    [key: string]: any;
}

export interface VisitorReportRecord {
    amvM_Id?: number;
    amvM_Name?: string;
    VMMV_VisitorName?: string;
    amvM_Contact_No?: string;
    VMMV_VisitorContactNo?: string;
    amvM_Emailid?: string;
    VMMV_VisitorEmailid?: string;
    date_Visit?: string;
    Date_Visit?: string;
    VMMV_MeetingDateTime?: string;
    time_Visit?: string;
    Time_Visit?: string;
    VMMV_EntryDateTime?: string;
    amvM_Out_Time?: string;
    VMMV_ExitDateTime?: string;
    VMMV_MeetingLocation?: string;
    amvM_Status?: string;
    VMMV_CkeckedInOutStatus?: string;
    amvM_Purpose?: string;
    VMMV_MeetingPurpose?: string;
    amvM_To_Meet?: string;
    AMVM_To_Meet?: string;
    [key: string]: any;
}

export interface VisitorReportFilterPayload {
    searchby: string; // 'all' | 'VMMV_VisitorName' | 'VMMV_VisitorContactNo' | 'VMMV_VisitorEmailid' | 'VMMV_MeetingDateTime' | 'AMVM_To_Meet'
    txtbox: string;
    all1: '1' | '0'; // '1' = Between Days, '0' = Month Wise
    fromdate?: string;
    todate?: string;
    month_id?: string;
}

export interface VisitorReportResponse {
    viewlist?: VisitorReportRecord[];
    [key: string]: any;
}
