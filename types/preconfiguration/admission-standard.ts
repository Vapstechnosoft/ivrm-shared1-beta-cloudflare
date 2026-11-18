export interface IAdmissionStandard {
    asC_Id?: number;
    asC_Adm_AddFieldsFlag?: number;
    asC_TC_AddFieldsFlag?: number;
    asC_MaxAgeApl_Flag?: number;
    asC_MinAgeApl_Flag?: number;
    admC_TCAllowBalanceFlg?: number; // ASC_TC_Payment mapped to this in get
    asC_LibraryAllowBalanceFlg?: number; // ASC_TC_Library mapped to this in get
    asC_ECS_Flag?: number;
    asC_Att_DefaultEntry_Type?: string; // 'P' | 'A'
    asC_Default_Gender?: string; // 'M' | 'F' | 'Ot'
    asC_ParentsMonthlyIncome_Flag?: number;
    asC_ParentsAnnualIncome_Flag?: number;
    asC_School_Address?: number;
    asC_Category_Address?: number;
    asC_DefaultPhotoUpload?: string; // '1' | '2'
    asC_DefaultSMS_Flag?: string; // 'F' | 'M' | 'S' | 'B'
    asC_Att_Scheduler_Flag?: string; // 'Periodwise' | 'EOD'
    asC_Att_Default_OrderFlag?: number; // 1-7
    asC_Stu_Photo_Path?: string | null;
    asC_Staff_Photo_Path?: string | null;
    asC_Logo_Path?: string | null;
    asC_Doc_Path?: string | null;
}

export interface IAdmissionStandardPayload {
    asc_Id: number;
    asc_Adm_AddFieldsFlag: number;
    asc_TC_AddFieldsFlag: number;
    asc_MaxAgeApl_Flag: number;
    asc_MinAgeApl_Flag: number;
    asc_Att_DefaultEntry_Type: string;
    asc_Default_Gender: string;
    asc_ParentsMonthlyIncome_Flag: string | number;
    asc_ParentsAnnualIncome_Flag: string | number;
    asc_School_Address: number;
    asc_Category_Address: number;
    asc_DefaultPhotoUpload: number | string;
    asc_Att_Default_OrderFlag: number;
    asc_Stu_Photo_Path: string | null;
    asc_Staff_Photo_Path: string | null;
    asc_Logo_Path: string | null;
    asc_Doc_Path: string | null;
    asc_DefaultSMS_Flag: string;
    asc_TC_Payment: number;
    asc_TC_Library: number;
    asc_ECS_Flag: number;
    asc_Att_Scheduler_Flag: string;
    asc_AdmNo_RegNo_RollNo_DefaultFlag: string;
    asc_DefaultDisplay_Flag: string;
    asc_Default_Clm__Adm_Flag: number;
    asc_Default_Clm__Rol_Flag: number;
    asc_Default_Clm__Reg_Flag: number;
}
