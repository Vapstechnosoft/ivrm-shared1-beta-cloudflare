export interface InstitutionModule {
    ivrmiM_Id: number;
    ivrmM_ModuleName: string;
    Selected?: boolean;
}

export interface InstitutionPage {
    ivrmimP_Id: number;
    ivrmmP_PageName: string;
    Selected?: boolean;
}

export interface Parameter {
    ismP_ID: number;
    ismP_NAME: string;
    select?: boolean;
}

export interface HeaderData {
    ivrmhE_Id: number;
    ivrmhE_Name: string;
    ivrmiM_Id: number;
    ivrmM_ModuleName: string;
    ivrmimP_Id: number;
    ivrmmP_PageName: string;
}

export interface MasterHeaderDetailsInitData {
    institutionModuleList: InstitutionModule[];
    institutionPageList: InstitutionPage[];
    parameterlist: Parameter[];
    headerdata: HeaderData[];
}

export interface MasterHeaderDetailsPayload {
    ivrmhE_Id: number;
    ivrmiM_Id: number;
    ivrmimP_Id: number;
    ivrmhE_Name: string;
    pageids: { ismP_ID: number }[];
}

export interface MasterHeaderDetailsSelectedRow {
    gridviewDetails: {
        ivrmhE_Id: number;
        ivrmiM_Id: number;
        ivrmimP_Id: number;
        ivrmhE_Name: string;
    }[];
    parameterlist: Parameter[];
}
