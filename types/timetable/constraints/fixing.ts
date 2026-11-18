export interface TTDayPeriodGridData {
    ttfdP_Id: number;
    asmaY_Year: string;
    ttmC_CategoryName: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    staffName: string;
    ismS_SubjectName: string;
    ttmD_DayName: string;
    ttmP_PeriodName: string;
    ttfdP_ActiveFlag: boolean;
}

export interface TTDayStaffGridData {
    ttfdS_Id: number;
    asmaY_Year: string;
    staffName: string;
    ttmD_Id: number;
    ttmD_DayName: string;
    // ttfdS_SUbSelcFlag: boolean;
    // ttfdS_ActiveFlag: boolean;
}

export interface TTDaySubjectGridData {
    ttfdsU_Id: number;
    asmaY_Year: string;
    ismS_SubjectName: string;
    ttmD_DayName: string;
    ttfdsU_SUbSelcFlag: boolean;
    ttfdsU_ActiveFlag: boolean;

    asmcL_Id: number;
    asmcL_ClassName: string;
    asmS_Id: number;
    asmC_SectionName: string;
    hrmE_Id: number;
    staffName: string;
}

export interface TTPeriodStaffGridData {
    ttfpS_Id: number;
    asmaY_Year: string;
    staffName: string;
    ttmP_PeriodName: string;
    ttfpS_SUbSelcFlag: boolean;
    ttfpS_ActiveFlag: boolean;
}

export interface TTPeriodSubjectGridData {
    ttfpsU_Id: number; //id-TTRPSU_Id
    asmaY_Year: string; //academic year-ASMAY_Year
    ismS_SubjectName: string; //subject- ISMS_SubjectName
    ttmP_Id: number; //id-TTMP_Id
    ttmP_PeriodName: string; //period-TTMP_PeriodName
    ttfpsU_SUbSelcFlag: boolean; //toggle button-TTRPSU_SUbSelcFlag
    ttfpsU_ActiveFlag: boolean; //toggle button-TTRPSU_ActiveFlag
}
