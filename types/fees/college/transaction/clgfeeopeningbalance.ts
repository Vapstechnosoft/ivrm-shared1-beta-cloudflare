export interface ICollegeFeeOpeningBalanceGrid {
    fcmoB_Id: number;
    asmaY_Id?: number;
    asmaY_Year?: string;
    amcsT_Id?: number;
    amcsT_FirstName?: string;
    amcsT_MiddleName?: string;
    amcsT_LastName?: string;
    amcsT_AdmNo?: string;
    acysT_RollNo?: string;
    fmG_Id?: number;
    fmG_GroupName?: string;
    fmH_Id?: number;
    fmH_FeeName?: string;
    ftI_Id?: number;
    ftI_Name?: string;
    fcmoB_Student_Due?: number;
    fcmoB_Institution_Due?: number;
    [key: string]: any;
}

export interface ICollegeFeeOpeningBalanceGroup {
    fmG_Id: number;
    fmG_GroupName: string;
    [key: string]: any;
}

export interface ICollegeFeeOpeningBalanceHead {
    fmH_Id: number;
    fmH_FeeName: string;
    [key: string]: any;
}

export interface ICollegeFeeOpeningBalanceInstallment {
    ftI_Id: number;
    ftI_Name: string;
    [key: string]: any;
}

export interface ICollegeFeeOpeningBalanceStudent {
    amcsT_Id: number;
    amcsT_FirstName: string;
    amcsT_MiddleName?: string;
    amcsT_LastName?: string;
    amcsT_AdmNo?: string;
    acysT_RollNo?: string;
    xyz?: boolean;
    FCMOB_Student_Due?: number;
    FCMOB_Institution_Due?: number;
    [key: string]: any;
}

export interface ICollegeFeeOpeningBalanceSavePayload {
    asmaY_Id?: number;
    ASMAY_Id?: number;
    fmG_Id?: number;
    FMG_Id?: number;
    fmH_Id?: number;
    FMH_Id?: number;
    ftI_Id?: number;
    FTI_Id?: number;
    sub_data: Array<{
        amcsT_Id?: number;
        AMCST_Id?: number;
        fcmoB_Student_Due?: number;
        FCMOB_Student_Due?: number;
        fcmoB_Institution_Due?: number;
        FCMOB_Institution_Due?: number;
        [key: string]: any;
    }>;
    [key: string]: any;
}

export interface ICollegeFeeOpeningBalanceAllDetailsResponse {
    yearlist?: any[];
    alldata?: ICollegeFeeOpeningBalanceGrid[];
    saveddata?: ICollegeFeeOpeningBalanceGrid[];
    studentlist?: ICollegeFeeOpeningBalanceStudent[];
    [key: string]: any;
}
