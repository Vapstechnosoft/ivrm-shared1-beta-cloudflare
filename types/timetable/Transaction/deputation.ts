export interface IDeputationForm {
    asmaY_Id: string;
    ttmD_Date: Date;
    absent_Staff_Flag: boolean;
    hrmE_Id: string;
    ttmD_Day: string;
    ttmD_Remarks: string;
    sms_Flag: boolean;
    email_Flag: boolean;
    notification_Flag: boolean;
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

export interface IDeputationInitialData {
    acayear?: IAcademicYearItem[];
    categorylist?: ICategoryItem[];
    classlist?: IClassItem[];
    stafflist?: IStaffItem[];
    daylist?: IDayItem[];
    [key: string]: any;
}

// 1. getabsentstaff payload
export interface IAbsentStaffPayload {
    ASMAY_Id: number;
    TTSD_Date: string;
    absflag?: boolean;
    TTMD_Id?: number;
    HRME_Id?: number;
}

// 2. get_period_alloted payload
export interface IPeriodAllotedPayload {
    ASMAY_Id: number;
    TTMD_Id: number;
    HRME_Id: number;
    TTSD_Date: string;
}

// 3. get_free_stfdets payload
export interface IFreeStaffPayload {
    ASMAY_Id: number;
    TTMD_Id: number;
    TTMP_Id: number;
    HRME_Id: number;
    TTSD_Date: string;
}

// 4. getalldetailsviewrecords2 payload (Popup 2 - Substitute Staff Weekly Timetable)
export interface IViewRecords2Payload {
    ASMAY_Id: number;
    HRME_Id: number;
}

// 5. viewrecordspopup9 payload (Popup 9 - Staff Day Timetable)
export interface IViewRecordsPopup9Payload {
    ASMAY_Id: number;
    HRME_Id: number;
    TTMD_Id: number;
}

// 6. viewdeputation payload (Popup 3 - Deputation History)
export interface IViewDeputationPayload {
    ASMAY_Id: number;
    HRME_Id: number;
    FLAG: string;
    TTSD_Date: string;
}

// 7. viewabsent payload (Popup 4 - Absent History)
export interface IViewAbsentPayload {
    ASMAY_Id: number;
    HRME_Id: number;
    FLAG: string;
    TTSD_Date: string;
}

// 8. savedetails payload
export interface ISubstitutedPeriodItem {
    ttmD_Id: number;
    ttmP_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    TTSD_DeputedStaff: number; // Sub_Id (HRME_Id of substitute)
}

export interface ISaveDeputationPayload {
    TTSD_Id?: number;
    ASMAY_Id: number;
    TTSD_Date: string;
    TTSD_AbsentStaff: number;
    TTSD_Remarks?: string;
    smsflag?: boolean;
    mailflag?: boolean;
    NOT_Flag?: boolean;
    subarray: ISubstitutedPeriodItem[];
}

// Substitute Staff Option in Dropdown
export interface ISubstituteStaffOption {
    HRME_Id: number;
    STAFF: string;
    EMPCODE?: string;
    DCNT?: number;
    WCNT?: number;
    MCNT?: number;
    YCNT?: number;
    asmaY_Id?: number;
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

// Row model for Absent Staff Time Table
export interface IPeriodAssignmentRow {
    ttmD_Id: number;
    ttmP_Id: number;
    ttmD_DayName?: string;
    ttmP_PeriodName: string;
    hrmE_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    ttfgD_Id?: number;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    ismS_SubjectName: string;
    substitutestafflist: ISubstituteStaffOption[];
    Sub_Id?: number | string;
    HRMEnew_Id?: number;
    daycnt?: number;
    weekcnt?: number;
    mntcnt?: number;
    currdaydeputed?: number;
    weekcntdeputed?: number;
    mntcntdeputed?: number;
    totaldeputedcount?: number;
    weekcnt1?: number;
    mntcnt1?: number;
    totalcnt1?: number;
    freeperioddaily?: number;
    freeperiodweekly?: number;
    [key: string]: any;
}
