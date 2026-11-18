export interface Staff {
    hrmE_Id: number;
    staffName: string;
    staffNamelst?: string;
}

export interface StaffReplacementInTheirTimeTableMasters {
    staff: Staff[];
}

export interface Period {
    ttmP_Id: number;
    ttmP_PeriodName: string;
}

export interface Day {
    ttmD_Id: number;
    ttmD_DayName: string;
}

export interface TimeTableItem {
    ttmP_Id: number;
    ttmD_Id: number;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    ismS_SubjectName: string;
    staffName: string;
}

export interface StaffReplacementReportResponse {
    periodslst: Period[];
    gridweeks: Day[];
    time_Table: TimeTableItem[];
    returnval?: boolean;
}
