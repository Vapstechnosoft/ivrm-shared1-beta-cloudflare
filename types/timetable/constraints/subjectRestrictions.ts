export interface SubjectRestrictionDayPeriodGridData {
    ttrdP_Id: number;
    asmaY_Year: string;
    ttmC_CategoryName: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    staffName: string;
    ismS_SubjectName: string;
    ttmP_PeriodName: string;
    ttmD_DayName: string;
    ttrdP_ActiveFlag: boolean;
    asmaY_Id: number;
}

export interface SubjectRestrictionDaySubjectGridData {
    ttrdsU_Id: number; //id
    asmaY_Year: string; //academic year
    ismS_SubjectName: string; //subject
    ttmD_Id: number; //day
    ttmD_DayName: string; //day
    ttrdsU_SUbSelcFlag: boolean; //action
    ttrdsU_ActiveFlag: boolean; //action
    asmaY_Id: number;
}

export interface SubjectRestrictionDayStaffGridData {
    ttrdS_Id: number; //id
    asmaY_Year: string; //academic year
    staffName: string; //staff
    ttmD_Id: number; //day
    ttmD_DayName: string; //day
    ttrdS_SUbSelcFlag: boolean; //action
    ttrdS_ActiveFlag: boolean; //action
    asmaY_Id: number;
}

export interface SubjectRestrictionPeriodStaffGridData {
    ttrpS_Id: number; //id
    asmaY_Year: string; //academic year
    staffName: string; //staff
    ttmD_Id: number; //day
    ttmP_PeriodName: string; //period
    ttrpS_SUbSelcFlag: boolean; //action
    ttrpS_ActiveFlag: boolean; //action
    asmaY_Id: number;
}

export interface SubjectRestrictionPeriodSubjectGridData {
    ttrpsU_Id: number; //id
    asmaY_Year: string; //academic year
    ismS_SubjectName: string; //subject
    ttmP_Id: number; //day
    ttmP_PeriodName: string; //period
    ttrpsU_SUbSelcFlag: boolean; //action
    ttrpsU_ActiveFlag: boolean; //action
    asmaY_Id: number;
}

export interface subjectRestriction_types {
    ttfG_Id: number; //AcademicYear
    asmaY_Year: string; //AcademicYear

    ttmC_Id: number; //category
    ttmC_CategoryName: string; //category

    asmcL_Id: number; //class
    asmcL_ClassName: string; //class

    asms_Id: number; //section
    asms_SectionName: string; //section

    hrmE_Id: number; //staff
    staffName: string; //staff

    ismS_Id: number; //subject
    ismS_SubjectName: string; //subject
}
