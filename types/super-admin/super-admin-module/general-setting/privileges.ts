export interface IPrivilegeRole {
    ivrmrT_Id: number;
    ivrmrT_Role: string;
}

export interface IPrivilegeModule {
    ivrmM_Id: number;
    ivrmM_ModuleName: string;
    checked?: boolean;
}

export interface IPrivilegePage {
    ivrmmP_Id: number;
    ivrmmP_PageName: string;
    checked?: boolean; // For selection from Master Grid
}

export interface IPrivilegeData {
    ivrmrP_Id?: number; // Existing ID
    ivrmmP_Id: number;
    ivrmmP_PageName: string;
    ivrmrP_AddFlag: boolean;
    ivrmrP_DeleteFlag: boolean;
    ivrmrP_UpdateFlag: boolean;
    ivrmrP_ProcessFlag: boolean;
    ivrmrP_ReportFlag: boolean;
    isNew?: boolean; // To distinguish between saved and new in UI
}

export interface IRolePrivilegeMapping {
    ivrmrP_Id: number;
    ivrmrT_Role: string;
    ivrmM_ModuleName: string;
    ivrmmP_PageName: string;
}

export interface ISearchPagesPayload {
    ivrmrT_Id: number;
    ivrmM_Id: number[];
}

export interface ISearchPagesApiRequestDTO {
    IVRMRT_Id: number;
    savetmpdata: Array<{ IVRMM_Id: number }>;
}

export interface ISavePrivilegesApiRequestDTO {
    IVRMRT_Id: number;
    savetmpdata: Array<{
        IVRMMP_Id: number;
        IVRMRP_AddFlag: boolean;
        IVRMRP_DeleteFlag: boolean;
        IVRMRP_UpdateFlag: boolean;
        IVRMRP_ProcessFlag: boolean;
        IVRMRP_ReportFlag: boolean;
    }>;
    previoussavetmpdata: Array<{
        IVRMRP_Id?: number;
        IVRMMP_Id: number;
        IVRMRP_AddFlag: boolean;
        IVRMRP_DeleteFlag: boolean;
        IVRMRP_UpdateFlag: boolean;
        IVRMRP_ProcessFlag: boolean;
        IVRMRP_ReportFlag: boolean;
    }>;
}
