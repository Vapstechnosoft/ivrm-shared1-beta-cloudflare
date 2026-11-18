export interface IMasterDayList {
    ttmD_Id: number;
    mI_Id: number;
    ttmD_DayName: string;
    ttmD_DayCode: string;
    order_Id: number;
    ttmD_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterDaySetOrderList {
    ttmD_Id: number;
    mI_Id: number;
    ttmD_DayName: string;
    ttmD_DayCode: string;
    order_Id: number;
    ttmD_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterBuildingList {
    ttmB_Id: number;
    mI_Id: number;
    ttmB_BuildingName: string;
    ttmB_ActiveFlag: string;
}

export interface IStaffAbbreviationList {
    ttmsaB_Id: number;
    mI_Id: number;
    hrmE_Id: number;
    ttmsaB_Abbreviation: string;
    asmaY_Id: number;
    createdDate: string;
    updatedDate: string;
    ttmsaB_ActiveFlag: boolean;
    firstName: string;
    middleName: string;
    lastName: string;
    ttmsaB_PerDayMaxDeputation: number;
    ttmsaB_PerWeekMaxDeputation: number;
    ttmsaB_PerYearMaxDeputation: number;
    ttmsaB_PerMonthMaxDeputation: number;
}

export interface ISubjectAbbreviationList {
    ttmsuaB_Id: number;
    mI_Id: number;
    subjectName: string;
    ttmsuaB_Abbreviation: string;
    ttmsuaB_ActiveFlag: boolean;
    ismS_Id: number;
}

export interface IStaffDropdownList {
    ttmsaB_Id: number;
    mI_Id: number;
    hrmE_Id: number;
    staffName: string;
    firstName: string;
    middleName: string;
    lastName: string;
    ttmsaB_ActiveFlag: boolean;
    asmaY_Id: number;
    createdDate: string;
    updatedDate: string;
}
export interface ISubjectDropdownList {
    ismS_Id: number;
    mI_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode: string;
    ismS_Max_Marks: number;
    ismS_Min_Marks: number;
    ismS_ExamFlag: number;
    ismS_PreadmFlag: number;
    ismS_BatchAppl: number;
    ismS_ActiveFlag: number;
    ismS_OrderFlag: number;
    ismS_AttendanceFlag: boolean;
    ismS_AtExtraFeeFlg: number;
    ismS_LanguageFlg: number;
    ismS_IVRSSubjectName: string;
    ismS_SubjectNameNew: string;
    createdDate: string;
    updatedDate: string;
}

export interface ICategoryClassMapping {
    academicName: string;
    className: string;
    categoryName: string;
    updatedDate: string;
    ttcC_Id: number;
}

export interface ITimeTableMasterCategory {
    ttmC_Id: number;
    ttmC_CategoryName: string;
    ttmC_ActiveFlag: boolean;
}

export interface ITimeTableMasterAcademicYear {
    asmaY_Id: number;
    mI_Id: number;
    asmaY_Year: string;
    asmaY_From_Date: string;
    asmaY_To_Date: string;
    asmaY_PreAdm_F_Date: string;
    asmaY_PreAdm_T_Date: string;
    asmaY_Order: number;
    asmaY_ActiveFlag: number;
    asmaY_Pre_ActiveFlag: number;
    is_Active: boolean;
    asmaY_ReggularFlg: boolean;
    asmaY_NewFlg: boolean;
    asmaY_NewAdmissionFlg: boolean;
    asmaY_Cut_Of_Date: string;
    asmaY_CreatedBy: number;
    asmaY_UpdatedBy: number;
    asmaY_AcademicYearCode: string;
    asmaY_RegularFeeFDate: string;
    asmaY_RegularFeeTDate: string;
    createdDate: string;
    updatedDate: string;
}
export interface ITimeTableCategoryDropDownData {
    ttmC_Id: number;
    mI_Id: number;
    ttmC_CategoryName: string;
    createdDate: string;
    updatedDate: string;
    ttmC_ActiveFlag: boolean;
}

export interface ITimeTableClassDropDownData {
    asmcL_Id: number;
    mI_Id: number;
    asmcL_ClassName: string;
    asmcL_ClassCode: string;
    asmcL_MinAgeYear: number;
    asmcL_MinAgeMonth: number;
    asmcL_MinAgeDays: number;
    asmcL_MaxAgeYear: number;
    asmcL_MaxAgeMonth: number;
    asmcL_MaxAgeDays: number;
    asmcL_Order: number;
    asmcL_MaxCapacity: number;
    asmcL_ActiveFlag: boolean;
    asmcL_PreadmFlag: number;
    createdDate: string;
    updatedDate: string;
}

export interface IBreakTimeSettingsList {
    ttmB_Id: number;
    mI_Id: number;
    asmayYear: string;
    className: string;
    dayName: string;
    ttmB_BreakName: string;
    ttmB_BreakStartTime: string;
    ttmB_BreakEndTime: string;
    ttmB_AfterPeriod: number;
    ttmB_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IBreakTimeSettingsDTO {
    TTMB_Id: number;
    ASMAY_Id: number;
    TTMC_Id: number;
    ArrayClassList: { asmcL_Id: number }[];
    ArrayDayList: { ttmD_Id: number }[];
    TTMB_AfterPeriod: number;
    TTMB_BreakName: string;
    TTMB_BreakStartTime: string;
    TTMB_BreakEndTime: string;
    ArraybeforeperiodsList: any[];
    ArrayafterperiodsList: any[];
    TTMB_ActiveFlag: boolean;
}

export interface IMasterPeriodList {
    ttmP_Id: number;
    mI_Id: number;
    ttmP_PeriodName: string;
    ttmP_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterPeriodClassList {
    ttmpC_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    ttmP_Id: number;
    ttmP_PeriodName: string;
    asmcL_ClassName: string;
    asmaY_Year: string;
    ttmpC_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterPeriodDetailsList {
    impcM_Id: number;
    imP_Id: number;
    amC_Id: number;
    categoryName: string;
    imP_PeriodName: number;
    imP_PeriodOrder: number;
    half: string;
}

export interface BreakTimeSettingsGridData {
    ttmB_Id: number;
    asmayYear: string;
    dayName: string;
    className: string;
    ttmB_BreakName: string;
    ttmB_BreakStartTime: string;
    ttmB_BreakEndTime: string;
    ttmB_AfterPeriod: number;
    ttmB_ActiveFlag: boolean;
}

export interface PeriodDistributionData {
    ttmB_Id: number;
    asmayYear: string;
    dayName: string;
    className: string;
    ttmB_BreakName: string;
    ttmB_BreakStartTime: string;
    ttmB_BreakEndTime: string;
    ttmB_AfterPeriod: number;
    ttmB_ActiveFlag: boolean;
}

export type PeriodDistributionColumn = {
    asmaY_Year: string;
    staffName: string;
    ttfpD_TotWeekPeriods: number;
    ttfpD_ActiveFlag: boolean;
    ttfpD_Id: number;
};

export interface PeriodDistributionViewRecord {
    ttfpdD_Id: number;
    asmaY_Year: string;
    ttmC_CategoryName: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    ismS_SubjectName: string;
    ttfpD_TotalPeriods: number;
    ttfpdD_ActiveFlag: boolean;
}

export interface IBreakTimeSettingsList {
    ttmB_Id: number;
    mI_Id: number;
    asmayYear: string;
    className: string;
    dayName: string;
    ttmB_BreakName: string;
    ttmB_BreakStartTime: string;
    ttmB_BreakEndTime: string;
    ttmB_AfterPeriod: number;
    ttmB_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IBreakTimeSettingsDTO {
    TTMB_Id: number;
    ASMAY_Id: number;
    TTMC_Id: number;
    ArrayClassList: { asmcL_Id: number }[];
    ArrayDayList: { ttmD_Id: number }[];
    TTMB_AfterPeriod: number;
    TTMB_BreakName: string;
    TTMB_BreakStartTime: string;
    TTMB_BreakEndTime: string;
    ArraybeforeperiodsList: any[];
    ArrayafterperiodsList: any[];
    TTMB_ActiveFlag: boolean;
}

export interface IMasterPeriodList {
    ttmP_Id: number;
    mI_Id: number;
    ttmP_PeriodName: string;
    ttmP_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterPeriodClassList {
    ttmpC_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    ttmP_Id: number;
    ttmP_PeriodName: string;
    asmcL_ClassName: string;
    asmaY_Year: string;
    ttmpC_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

// export interface IPeriodTimeSettingList {
//     ttmdpT_Id: number;
//     mI_Id: number;
//     asmaY_Id: number;
//     ttmC_Id: number;
//     ttmP_Id: number;
//     ttmD_Id: number;
//     ttmdpT_StartTime: string;
//     ttmdpT_EndTime: string;
//     ttmdpT_ActiveFlag: boolean;
//     asmaY_Year: string;
//     ttmC_CategoryName: string;
//     ttmP_PeriodName: string;
//     ttmD_DayName: string;
//     createdDate: string;
//     updatedDate: string;
// }

export interface IMasterDayClassWise {
    ttmdC_Id: number;
    classname: string;
    academicyr: string;
    ttmD_DayName: string;
    ttmdC_ActiveFlag: boolean;
}

export interface IPeriodTimeSettingData {
    ttmdpT_Id: number;
    asmaY_Year: string;
    asmaY_Id: number;
    ttmD_Id: number;
    ttmD_DayName: string;
    ttmC_CategoryName: string;
    ttmP_PeriodName: string;
    ttmC_Id: number;
    ttmP_Id: number;
    ttmdpT_StartTime: string;
    ttmdpT_EndTime: string;
    ttmdpT_ActiveFlag: boolean;
}

export interface IPeriodAllocationMasterDay {
    ttmP_Id: number;
    mI_Id: number;
    ttmP_PeriodName: string;
    ttmP_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface AcademicYearDropDownTT {
    asmaY_Id: number;
    mI_Id: number;
    asmaY_Year: string;
    asmaY_From_Date: string;
    asmaY_To_Date: string;
    asmaY_PreAdm_F_Date: string;
    asmaY_PreAdm_T_Date: string;
    asmaY_Order: number;
    asmaY_ActiveFlag: number;
    asmaY_Cut_Of_Date: string;
    asmaY_Pre_ActiveFlag: number;
    is_Active: boolean;
    asmaY_ReggularFlg: boolean;
    asmaY_NewFlg: boolean;
    asmaY_NewAdmissionFlg: boolean;
    asmaY_CreatedBy: number;
    asmaY_UpdatedBy: number;
    asmaY_AcademicYearCode: string;
    asmaY_RegularFeeFDate: string;
    asmaY_RegularFeeTDate: string;
    createdDate: string;
    updatedDate: string;
}

export interface CategoryDropDownTT {
    ttmC_Id: number;
    mI_Id: number;
    ttmC_CategoryName: string;
    createdDate: string;
    updatedDate: string;

    ttmC_ActiveFlag: boolean;
}

export interface ClassDropDownDataTT {
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

export interface DaysDropDownDataTT {
    ttmD_Id: number;
    mI_Id: number;
    ttmD_DayName: string;
    ttmD_DayCode: string;
    order_Id: number;
    ttmD_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface ICategoryDropDownDataMasterPeriod {
    amC_Id: number;
    mI_Id: number;
    amC_Name: string;
    amC_Address: string;
    amC_Type: string;
    amC_RegNoPrefix: string;
    amC_ActiveFlag: number;
    amC_PAApplicationName: string;
    amC_Logo: string;
    amC_FilePath: string;
    createdDate: string;
    updatedDate: string;
}

export interface PeriodDistruction {
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

export interface IMasterBuildClassSectionGrid {
    ttmbcS_Id: number;
    ttmB_Id: number;
    asmcL_ID: number;
    ttmB_BuildingName: string;
    asmcL_ClassName: string;
    asmS_ID: number;
    ttmbcS_ActiveFlag: boolean;
    asmC_SectionName: string;
}

export type PeriodDropdownData = {
    ttmP_Id: number;
    mI_Id: number;
    ttmP_PeriodName: string;
    ttmP_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
};
