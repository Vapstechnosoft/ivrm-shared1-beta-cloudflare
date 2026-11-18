export interface IstaffLoadDataTTStaffReport {
    ttlAB_Id: number;
    ASMAYYear: string;
    CategoryName: string;
    TTLAB_LABLIBName: string;
    TTLAB_ActiveFlag: boolean;

    asmcL_Id: number; //class
    asmcL_ClassName: string; //classexport async
}

export interface ISectionDropdown {
    asmS_Id: number;
    mI_Id: number;
    asmC_SectionName: string;
    asmC_SectionCode: string;
    asmC_Order: number;
    asmC_ActiveFlag: number;
    asmC_MaxCapacity: number;
    createdDate: string; // ISO date string
    updatedDate: string; // ISO date string

    asmcL_Id: number; //class
    asmcL_ClassName: string; //classexport async
}
export interface IDeputationAcademicYear {
    ttfG_Id: number;
    asmaY_Year: string;
}

export interface IDeputationStaff {
    hrmE_Id: number;
    staffName: string;
}

export interface IDeputationDay {
    ttmD_Id: number;
    mI_Id: number;
    ttmD_DayName: string;
    ttmD_DayCode: string;
    order_Id: number;
    ttmD_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface SectionDropDownDataTT {
    asmS_Id: number;
    mI_Id: number;
    asmC_SectionName: string;
    asmC_SectionCode: string;
    asmC_Order: number;
    asmC_ActiveFlag: number; // API returns 1/0 (not boolean)
    asmC_MaxCapacity: number;
    createdDate: string;
    updatedDate: string;
}

export interface IDeputationLoadData {
    stafflist: IDeputationStaff[];
    gridweeks: IDeputationDay[];
}

export interface StaffWorkingHoursReportItem {
    ttfG_Id: number;
    hrmE_Id: number;
    ttmD_Id: number;
    asmaY_Year: string;
    staffName: string;
    ttmD_DayName: string;
}
