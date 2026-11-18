export interface bifurcationconstraints {
    ttmC_Id: number;
    mI_Id: number;
    ttmC_CategoryName: string;
    createdDate: string;
    updatedDate: string;
    ttmC_ActiveFlag: boolean;
}

export interface AcademicYear {
    ttfG_Id: number;
    asmaY_Year: string;
}

export interface SectionDropdownDataBifurcation {
    asmS_Id: number;
    mI_Id: number;
    asmC_SectionName: string;
    asmC_SectionCode: string;
    asmC_Order: number;
    asmC_ActiveFlag: number; // 1 or 0 from backend
    asmC_MaxCapacity: number;
    createdDate: string;
    updatedDate: string;
}

export interface StaffDropdownDataBifurcation {
    hrmE_Id: number;
    staffName: string;
}

export interface SubjectDropdownData {
    ismS_Id: number;
    mI_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode: string;
    ismS_Max_Marks: number;
    ismS_Min_Marks: number;
    ismS_ExamFlag: number;
    ismS_PreadmFlag: number;
    ismS_SubjectFlag: number;
    ismS_BatchAppl: number;
    ismS_ActiveFlag: number;
    ismS_OrderFlag: number;
    createdDate: string;
    updatedDate: string;
    ismS_AttendanceFlag: boolean;
    ismS_AtExtraFeeFlg: number;
    ismS_LanguageFlg: number;
    ismS_TTFlag: boolean;
    ismS_IVRSSubjectName: string;
    ismS_DiscontinuedFlg: boolean;
    ismS_SubjectNameNew: string;
}

export interface ClassDropdownDataTTBifurcation {
    asmcL_Id: number;
    mI_Id: number;
    asmcL_ClassName: string;
    asmcL_MinAgeYear: number;
    asmcL_MinAgeMonth: number;
    asmcL_MinAgeDays: number;
    asmcL_MaxAgeYear: number;
    asmcL_MaxAgeMonth: number;
    asmcL_MaxAgeDays: number;
    asmcL_Order: number;
    asmcL_ClassCode: string;
    asmcL_ActiveFlag: boolean;
    asmcL_MaxCapacity: number;
    asmcL_PreadmFlag: number;
    createdDate: string;
    updatedDate: string;
}

export interface IConsecutiveConstraintDetails {
    ttC_Id: number;
    asmayYear: string;
    categoryName: string;
    noOfPeriods: number;
    className: string;
    sectionName: string;
    staffName: string;
    subjectName: string;
    ttC_ActiveFlag: boolean;
}
