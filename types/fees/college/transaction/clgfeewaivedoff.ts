export interface ICollegeFeeWaivedOffGrid {
    fcswO_Id: number;
    amcsT_FirstName: string;
    fmH_FeeName: string;
    ftI_Name: string;
    fcswO_WaivedOffAmount: number;
    fcswO_Date: string;
    asmaY_Id?: number;
    amcsT_Id?: number;
    amcO_Id?: number;
    amB_Id?: number;
    amsE_Id?: number;
    fmG_Id?: number;
    fmH_Id?: number;
    ftI_Id?: number;
    fcmaS_Id?: number;
    [key: string]: any;
}

export interface ICollegeAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order?: number;
    is_Active?: boolean;
    [key: string]: any;
}

export interface ICollegeCourse {
    amcO_Id: number;
    amcO_CourseName: string;
    amcO_CourseCode?: string;
    [key: string]: any;
}

export interface ICollegeBranch {
    amB_Id: number;
    amB_BranchName: string;
    amB_BranchCode?: string;
    [key: string]: any;
}

export interface ICollegeSemester {
    amsE_Id: number;
    amsE_SEMName: string;
    amsE_SEMCode?: string;
    amsE_SEMOrder?: number;
    [key: string]: any;
}

export interface ICollegeStudent {
    amcsT_Id: number;
    amcsT_FirstName: string;
    amcsT_MiddleName?: string;
    amcsT_LastName?: string;
    amcsT_AdmNo?: string;
    amcsT_RegistrationNo?: string;
    [key: string]: any;
}

export interface ICollegeFeeGroup {
    fmG_Id: number;
    fmG_GroupName: string;
    selected?: boolean;
    [key: string]: any;
}

export interface ICollegeFeeHeadItem {
    fmH_Id: number;
    fmH_FeeName: string;
    ftI_Id: number;
    ftI_Name: string;
    fcsS_ToBePaid: number;
    fcsS_PaidAmount: number;
    fcmaS_Id: number;
    fmG_Id: number;
    fcswO_WaivedOffAmount?: number;
    FCSWO_WaivedOffAmount?: number;
    multiplegroup?: string;
    xyz?: boolean;
    selected?: boolean;
    [key: string]: any;
}

export interface ICollegeFeeWaivedOffAllDetailsResponse {
    yearlist?: ICollegeAcademicYear[];
    alldata?: ICollegeFeeWaivedOffGrid[];
    saveddata?: ICollegeFeeWaivedOffGrid[];
    [key: string]: any;
}

export interface ICollegeFeeWaivedOffCheckedItem {
    fmG_Id: number;
    fmH_Id: number;
    ftI_Id: number;
    fcmaS_Id: number;
    fcswO_WaivedOffAmount: number;
}

export interface ICollegeFeeWaivedOffSavePayload {
    fcswO_Id: number;
    asmaY_Id: number;
    amcsT_Id: number;
    fcswO_Date: string;
    checkedlist: ICollegeFeeWaivedOffCheckedItem[];
    [key: string]: any;
}

export interface ICollegeFeeWaivedOffEditDetails {
    fcswO_Id: number;
    asmaY_Id: number;
    amcO_Id: number;
    amB_Id: number;
    amsE_Id: number;
    amcsT_Id: number;
    fcswO_Date: string;
    filterrefund?: string;
    grouplist?: ICollegeFeeGroup[];
    headlist?: ICollegeFeeHeadItem[];
    [key: string]: any;
}
