import type { Key } from 'react';

export interface AcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface Staff {
    hrmE_Id: number;
    staffNamelst?: string;
}

export interface Class {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface Section {
    ismS_Id?: Key | null | undefined;
    asms_Id: number;
    asms_SectionName: string;
    asmC_SectionName?: string;
}

export interface Subject {
    ismS_Id: number;
    ismS_SubjectName: string;
}

export interface StaffPeriodTransferMasters {
    years: AcademicYear[];
    classes: Class[];
    sections: Section[];
    staff: Staff[];
    subjects: Subject[];
}

// Data models for StaffPeriodTransformFacade/getrpt response
export interface PeriodItem {
    ttmP_Id: number;
    mI_Id?: number;
    ttmP_PeriodName: string;
    ttmP_ActiveFlag?: boolean;
    createdDate?: string;
    updatedDate?: string;
}

export interface GridWeekItem {
    ttmD_Id: number;
    mI_Id?: number;
    ttmD_DayName: string;
    ttmD_DayCode?: string;
    order_Id?: number;
    ttmD_ActiveFlag?: boolean;
    createdDate?: string;
    updatedDate?: string;
}

export interface TimeTableItem {
    ttfgD_Id: number;
    ttfG_Id?: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    hrmE_Id?: number;
    ismS_Id?: number;
    ttmD_Id?: number;
    ttmP_Id?: number;
    ttmC_Id?: number;
    ttmD_DayName: string;
    ttmP_PeriodName: string;
    asmcL_ClassName?: string;
    asmC_SectionName?: string;
    ismS_SubjectName?: string;
    staffName?: string;
    ttmC_CategoryName?: string;
}

export interface ClassDetailItem {
    asmcL_Id: number;
    mI_Id?: number;
    asmcL_ClassName: string;
    asmcL_MinAgeYear?: number;
    asmcL_MinAgeMonth?: number;
    asmcL_MinAgeDays?: number;
    asmcL_MaxAgeYear?: number;
    asmcL_MaxAgeMonth?: number;
    asmcL_MaxAgeDays?: number;
    asmcL_Order?: number;
    asmcL_ClassCode?: string;
    asmcL_ActiveFlag?: boolean;
    asmcL_MaxCapacity?: number;
    asmcL_PreadmFlag?: number;
    createdDate?: string;
    updatedDate?: string;
}

export interface SecDetailItem {
    asmS_Id: number;
    mI_Id?: number;
    asmC_SectionName: string;
    asmC_SectionCode?: string;
    asmC_Order?: number;
    asmC_ActiveFlag?: number | boolean;
    asmC_MaxCapacity?: number;
    createdDate?: string;
    updatedDate?: string;
}

export interface SubjectDetailItem {
    ismS_Id: number;
    mI_Id?: number;
    ismS_SubjectName: string;
    ismS_SubjectCode?: string;
    ismS_Max_Marks?: number;
    ismS_Min_Marks?: number;
    ismS_ExamFlag?: number;
    ismS_PreadmFlag?: number;
    ismS_SubjectFlag?: number;
    ismS_BatchAppl?: number;
    ismS_ActiveFlag?: number | boolean;
    ismS_OrderFlag?: number;
    createdDate?: string;
    updatedDate?: string;
    ismS_AttendanceFlag?: boolean;
    ismS_AtExtraFeeFlg?: number;
    ismS_LanguageFlg?: number;
    ismS_TTFlag?: boolean;
    ismS_IVRSSubjectName?: string;
    ismS_DiscontinuedFlg?: boolean;
    ismS_SubjectNameNew?: string;
}

export interface StaffDropdownItem {
    hrmE_Id: number;
    staffNamelst: string;
}

export interface StaffPeriodTransferReportData {
    periodslst: PeriodItem[];
    gridweeks: GridWeekItem[];
    time_Table: TimeTableItem[];
    classdetails?: ClassDetailItem[];
    secdetails?: SecDetailItem[];
    subjectdet?: SubjectDetailItem[];
    staffDrpDwnto?: StaffDropdownItem[];
}

export interface StaffPeriodTransferReportResponse {
    success: boolean;
    message: string;
    data: StaffPeriodTransferReportData;
}

export interface SaveStaffPeriodTransferPayload {
    ASMAY_Id: number;
    HRME_IdTO: number;
    Time_Table: {
        TTFGD_Id: number;
    }[];
}

