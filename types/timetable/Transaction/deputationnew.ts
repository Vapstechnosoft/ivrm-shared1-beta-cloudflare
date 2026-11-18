export interface IDeputationNewFormValues {
    asmaY_Id: string;
    ttmD_Date: Date;
    ttmD_Day: string;
    ttmD_Id: number;
    absflag: boolean;
    hrmE_Id: string;
    remarks: string;
    sms_Flag: boolean;
    email_Flag: boolean;
    not_Flag: boolean;
}

export interface IAcademicYearItem {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_From_Date?: string;
    asmaY_To_Date?: string;
    [key: string]: any;
}

export interface ICategoryItem {
    ttmC_Id: number;
    ttmC_CategoryName: string;
    [key: string]: any;
}

export interface IClassItem {
    asmcL_Id: number;
    asmcL_ClassName: string;
    [key: string]: any;
}

export interface IStaffItem {
    hrmE_Id: number;
    staffName?: string;
    hrmE_EmployeeCode?: string;
    hrmE_EmployeeFirstName?: string;
    hrmE_EmployeeMiddleName?: string;
    hrmE_EmployeeLastName?: string;
    [key: string]: any;
}

export interface IDayItem {
    ttmD_Id: number;
    ttmD_DayName: string;
    ttmD_DayCode?: string;
    [key: string]: any;
}

export interface IDeputationNewInitialData {
    acayear?: IAcademicYearItem[];
    categorylist?: ICategoryItem[];
    classlist?: IClassItem[];
    stafflist?: IStaffItem[];
    daylist?: IDayItem[];
    [key: string]: any;
}

export interface IAbsentStaffPayload {
    ASMAY_Id: number;
    TTSD_Date: string;
    absflag: boolean;
}

export interface IPeriodAllotedPayload {
    ASMAY_Id: number;
    TTMD_Id: number;
    HRME_Id: number;
    TTSD_Date: string;
}

export interface IFreeStaffPayload {
    ASMAY_Id: number;
    TTMD_Id: number;
    TTMP_Id: number;
    HRME_Id: number;
    TTSD_Date: string;
}

export interface IViewRecords2Payload {
    ASMAY_Id: number;
    HRME_Id: number;
}

export interface IViewRecordsPopup9Payload {
    ASMAY_Id: number;
    HRME_Id: number;
    TTMD_Id: number;
}

export interface IViewDeputationPayload {
    ASMAY_Id: number;
    HRME_Id: number;
    FLAG: string;
    TTSD_Date: string;
}

export interface IViewAbsentPayload {
    ASMAY_Id: number;
    HRME_Id: number;
    FLAG: string;
    TTSD_Date: string;
}

export interface ISubstituteStaffOption {
    HRME_Id: number;
    STAFF: string;
    EMPCODE?: string;
    DCNT?: number | string;
    WCNT?: number | string;
    MCNT?: number | string;
    YCNT?: number | string;
    asmaY_Id?: number;
    deviceid?: string;
    freeperioddaily?: number;
    freeperiodweekly?: number;
    daycnt?: number;
    weekcnt?: number;
    mntcnt?: number;
    totalcnt?: number;
    daycnt1?: number;
    weekcnt1?: number;
    mntcnt1?: number;
    totalcnt1?: number;
    WWCNT?: number;
    DAYTL?: number;
    list?: any[];
    [key: string]: any;
}

export interface IPeriodAssignmentRow {
    ttmD_Id: number;
    ttmP_Id: number;
    ttmD_DayName?: string;
    ttmP_PeriodName?: string;
    hrmE_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    ttfgD_Id?: number;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    ismS_SubjectName: string;
    substitutestafflist: ISubstituteStaffOption[];
    Sub_Id?: string;
    HRMEnew_Id?: number;
    daycnt?: number;
    weekcnt?: number;
    currdaydeputed?: number;
    weekcntdeputed?: number;
    mntcntdeputed?: number;
    totaldeputedcount?: number;
    freeperioddaily?: number;
    freeperiodweekly?: number;
    weekcnt1?: number;
    mntcnt1?: number;
    totalcnt1?: number;
    [key: string]: any;
}

export interface ISubarrayItem {
    ttmD_Id: number;
    ttmP_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    TTSD_DeputedStaff: number;
}

export interface ISaveDeputationNewPayload {
    TTSD_Id?: number;
    ASMAY_Id: number;
    TTSD_Date: string;
    TTSD_AbsentStaff: number;
    TTSD_Remarks?: string;
    smsflag: boolean;
    mailflag: boolean;
    NOT_Flag: boolean;
    subarray: ISubarrayItem[];
}

export interface IDeputationHistoryRecord {
    TTSD_Date: string;
    ASMCL_ClassName?: string;
    ASMC_SectionName?: string;
    TTMD_DayName?: string;
    TTMP_PeriodName?: string;
    EMPNAME?: string;
    TTSD_Remarks?: string;
    [key: string]: any;
}
