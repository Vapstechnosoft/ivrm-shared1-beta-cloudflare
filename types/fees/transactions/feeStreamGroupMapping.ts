export interface IFeeStreamGroupMappingGrid {
    fmsgM_Id: number;
    FMSGM_Id?: number;
    fmG_Id: number;
    FMG_Id?: number;
    asmaY_Id: number;
    ASMAY_Id?: number;
    pasL_ID: number;
    PASL_ID?: number;
    asmcL_Id: number;
    ASMCL_Id?: number;
    asmaY_Year: string;
    ASMAY_Year?: string;
    asmcL_ClassName: string;
    ASMCL_ClassName?: string;
    fmG_GroupName: string;
    FMG_GroupName?: string;
    pasL_Name: string;
    PASL_Name?: string;
    fmsgM_Active: number | boolean;
    FMSGM_Active?: number | boolean;
}

export interface IFeeStreamGroupMappingAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order?: number;
    ASMAY_Id?: number;
    ASMAY_Year?: string;
}

export interface IFeeStreamGroupMappingClass {
    asmcL_Id: number;
    asmcL_ClassName: string;
    asmcL_Order?: number;
    ASMCL_Id?: number;
    ASMCL_ClassName?: string;
}

export interface IFeeStreamGroupMappingGroup {
    fmG_Id: number;
    fmG_GroupName: string;
    FMG_Id?: number;
    FMG_GroupName?: string;
    Selected?: boolean;
}

export interface IFeeStreamGroupMappingStream {
    pasL_ID: number;
    pasL_Name: string;
    PASL_ID?: number;
    PASL_Name?: string;
    Selected?: boolean;
}

export interface IFeeStreamGroupMappingSavePayload {
    FMSGM_Id: number;
    ASMAY_Id: number;
    ASMCL_ID: number;
    FMG_Id?: number;
    PASL_ID?: number;
    groupList: { FMG_Id: number }[];
    streamList: { PASL_ID: number }[];
    TempararyArrayList?: any[];
    TempararyArrayList1?: any[];
}
