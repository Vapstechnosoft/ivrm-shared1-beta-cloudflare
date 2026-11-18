export interface ICollegeFeePrivilegeList {
    fgL_Id: number;
    user_Id: number;
    normalizedUserName: string;
    fmG_GroupName: string;
    fmH_FeeName: string;
    ivrmrT_Role: string;
    fmG_ID?: number;
    fmH_Id?: number;
    asmaY_Id?: number;
    ivrmrT_Id?: number;
    [key: string]: any;
}

export interface ICollegeAcademicYear {
    asmaY_Id: number;
    mI_Id?: number;
    asmaY_Year: string;
    asmaY_From_Date?: string;
    asmaY_To_Date?: string;
    asmaY_PreAdm_F_Date?: string;
    asmaY_PreAdm_T_Date?: string;
    asmaY_Order?: number;
    asmaY_ActiveFlag?: number;
    asmaY_Cut_Of_Date?: string;
    asmaY_Pre_ActiveFlag?: number;
    is_Active?: boolean;
    asmaY_ReggularFlg?: boolean;
    asmaY_NewFlg?: boolean;
    asmaY_NewAdmissionFlg?: boolean;
    asmaY_TransportSDate?: string | null;
    asmaY_TransportEDate?: string | null;
    asmaY_CreatedBy?: number;
    asmaY_UpdatedBy?: number;
    asmaY_ReferenceDate?: string | null;
    asmaY_AcademicYearCode?: string;
    asmaY_AdvanceFeeDate?: string | null;
    asmaY_RegularFeeFDate?: string | null;
    asmaY_RegularFeeTDate?: string | null;
    asmaY_ArrearFeeDate?: string | null;
    createdDate?: string;
    updatedDate?: string;
    [key: string]: any;
}

export interface ICollegeFeeGroup {
    fmG_Id: number;
    mI_Id?: number;
    fmG_GroupName: string;
    fmG_Remarks?: string;
    fmG_CompulsoryFlag?: string;
    fmG_ActiceFlag?: boolean;
    user_id?: number;
    fmG_Order?: number | null;
    fmG_BatchwiseFeeApplFlg?: boolean;
    fmG_TransportFlg?: boolean;
    fmG_HostelFlg?: boolean;
    fmG_RegNewFlg?: string;
    createdDate?: string;
    updatedDate?: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface ICollegeFeeHead {
    fmH_Id: number;
    mI_Id?: number;
    fmH_FeeName: string;
    fmH_Flag?: string;
    fmH_RefundFlag?: boolean;
    fmH_PDAFlag?: boolean;
    fmH_SpecialFeeFlag?: boolean;
    fmH_Order?: number;
    fmH_ActiveFlag?: boolean;
    user_id?: number;
    createdDate?: string;
    updatedDate?: string;
    hea?: boolean;
    [key: string]: any;
}

export interface ICollegeFeeRole {
    ivrmrT_Id: number;
    ivrmrT_Role: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface ICollegeFeeUser {
    userId?: number;
    user_Id?: number;
    id?: number;
    normalizedUserName?: string;
    userName?: string;
    ivrmrT_Id?: number;
    usr?: boolean;
    [key: string]: any;
}

export interface ICollegeFeePrevilegeAllDetails {
    adcyear?: ICollegeAcademicYear[];
    group?: ICollegeFeeGroup[];
    head?: ICollegeFeeHead[];
    role?: ICollegeFeeRole[];
    prelist?: ICollegeFeePrivilegeList[];
    [key: string]: any;
}

export interface ICollegeFeePrivilegeSavePayload {
    fgL_Id?: number;
    FGL_Id?: number;
    asmaY_Id: number;
    ASMAY_Id: number;
    fmG_ID: number;
    FMG_ID: number;
    ivrmrT_Id: number;
    IVRMRT_Id: number;
    grouphead: Array<{
        fmH_Id: number;
        FMH_Id?: number;
        [key: string]: any;
    }>;
    username: Array<{
        userId: number;
        UserId?: number;
        [key: string]: any;
    }>;
}
