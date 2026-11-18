export interface IMasterConfiguration {
    ispaC_Id: number;
    mO_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    amC_Id?: number;
    AMC_Id?: number;
    amcoC_Id?: number;
    AMCOC_Id?: number;
    amC_Name?: string;
    amcoC_Name?: string;

    // Grid extra properties
    mO_Name?: string;
    mI_Name?: string;
    asmaY_Year?: string;

    ispaC_ApplnDownladFlag?: number;
    ispaC_EnquiryApplFlag?: number;
    ispaC_EnqSMSFlag?: number;
    ispaC_EnqMailFlag?: number;
    ispaC_EnqMailBackground?: string;
    ispaC_DOBMinAgeFlag?: number;
    ispaC_ApplCutOffDateFlag?: number;
    ispaC_DOBMaxAgeFlag?: number;
    ispaC_OralMarksFlag?: number;
    ispaC_NoofApplications?: number;

    ispaC_ApplSMSFlag?: number;
    ispaC_ApplMailFlag?: number;
    ispaC_Healthapp?: number;
    ispaC_ApplMailBackground?: string;
    ispaC_WrittenTestSchApplFlag?: number;
    ispaC_CommonScheduleFlag?: number;
    ispaC_RegSMSFlag?: number;
    ispaC_RegMailFlag?: number;
    ispaC_RegMailBackground?: string;
    ispaC_ApplNoGenFlag?: number;
    ispaC_EnquiryNoGenFlag?: number;
    ispaC_RgNoGenFlag?: number;
    ispaC_HostelFlag?: number;
    ispaC_TransaportFlag?: number;
    ispaC_SibblingConcessionFlag?: number;
    ispaC_ParentConcessionFlag?: number;
    ispaC_ECSFlag?: number;
    ispaC_GymFlag?: number;
    ispaC_FatherAliveFlag?: number;
    ispaC_MotherAliveFlag?: number;
    ispaC_MaritalStatusFlag?: number;
    ispaC_OralTestSchApplFlag?: number;
    ispaC_AdmCategoryFlag?: number;
    ispaC_RegFeeFlag?: number;
    ispaC_MarksEntry?: number;
    ispaC_AdmissionTransfer?: number;
    ispaC_FeePaymentFlag?: number;

    ispaC_OralByMax_Marks?: number;
    ispaC_DefaultStatusFlag?: number;
    ispaC_OralTestBy?: number;
    ispaC_ApplIssueFlag?: number;
    ispaC_ApplFeeFlag?: number;
    ispaC_Transfer_Settings_Flag?: number;
    ispaC_OfflineFee_Flag?: number;
    ispaC_Transfer_Settings_after_payment_Flag?: number;
    ispaC_ProspectusFlag?: number;
    ispaC_ProsptFeeApp?: number;
    ispaC_SeatBlockFlag?: number;
    ispaC_OralTestApplFlag?: number;
    ispaC_WrittenTestApplFlag?: number;
    ispaC_ApplNoIncrementFlg?: number;
    ispaC_ApplNoIncrementBy?: number;
}

export interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IStudentCategory {
    amC_Id?: number;
    amC_Name?: string;
    amc_Id?: number;
    amc_Name?: string;
    AMC_Id?: number | boolean;
    AMC_Name?: string;
    amcoC_Id?: number;
    amcoC_Name?: string;
    amcoc_Id?: number;
    amcoc_Name?: string;
    AMCOC_Id?: number | boolean;
    AMCOC_Name?: string;
}

export interface IMasterConfigurationResponse {
    academicList: IAcademicYear[];
    studentlicategorylist: IStudentCategory[];
    mI_SchoolCollegeFlag?: string;
    schoolCollegeFlag?: string;
    SchoolCollegeFlag?: string;
    MI_SchoolCollegeFlag?: string;
    masterConfigList: IMasterConfiguration[];
    mstConfigList: IMasterConfiguration[]; // Used for edit data
}
