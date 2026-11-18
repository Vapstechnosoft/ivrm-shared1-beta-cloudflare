export interface ICollegeFeeRefundableGrid {
    fcR_Id: number;
    asmaY_Id?: number;
    amcsT_Id?: number;
    amcO_Id?: number;
    amB_Id?: number;
    amsE_Id?: number;
    amcsT_FirstName?: string;
    fcR_Date?: string;
    fcR_RefundNo?: string;
    fcR_ModeOfPayment?: string;
    fcR_RefundAmount?: number;
    fcR_RefundRemarks?: string;
    fmH_FeeName?: string;
    ftI_Name?: string;
    fmG_Id?: number;
    fmH_Id?: number;
    ftI_Id?: number;
    fcsS_Id?: number;
    [key: string]: any;
}

export interface ICollegeFeeRefundableAllDetailsResponse {
    yearlist?: ICollegeFeeRefundableAcademicYear[];
    alldata?: ICollegeFeeRefundableGrid[];
    saveddata?: ICollegeFeeRefundableGrid[];
    [key: string]: any;
}

export interface ICollegeFeeRefundableAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order?: number;
    is_Active?: boolean;
    [key: string]: any;
}

export interface ICollegeFeeRefundableCourse {
    amcO_Id: number;
    amcO_CourseName: string;
    amcO_CourseCode?: string;
    [key: string]: any;
}

export interface ICollegeFeeRefundableBranch {
    amB_Id: number;
    amB_BranchName: string;
    amB_BranchCode?: string;
    [key: string]: any;
}

export interface ICollegeFeeRefundableSemester {
    amsE_Id: number;
    amsE_SEMName: string;
    amsE_SEMCode?: string;
    amsE_SEMOrder?: number;
    [key: string]: any;
}

export interface ICollegeFeeRefundableStudent {
    amcsT_Id: number;
    amcsT_FirstName: string;
    amcsT_MiddleName?: string;
    amcsT_LastName?: string;
    amcsT_AdmNo?: string;
    amcsT_RegistrationNo?: string;
    [key: string]: any;
}

export interface ICollegeFeeRefundableStudentByAmst {
    amcsT_Id?: number;
    amcsT_FirstName?: string;
    fcsS_Id?: number;
    [key: string]: any;
}

export interface ICollegeFeeRefundableGroup {
    fmG_Id: number;
    fmG_GroupName: string;
    selected?: boolean;
    [key: string]: any;
}

export interface ICollegeFeeRefundableHeadItem {
    fcsS_Id: number;
    fmH_Id: number;
    ftI_Id: number;
    fmG_Id: number;
    fmH_FeeName?: string;
    ftI_Name?: string;
    fcsS_ToBePaid?: number;
    fcsS_PaidAmount?: number;
    fcR_RefundAmount?: number;
    isSelected?: boolean;
    [key: string]: any;
}

export interface ICollegeFeeRefundableSavePayload {
    fcR_Id: number;
    asmaY_Id: number;
    amcsT_Id: number;
    fcR_Date: string;
    fcR_RefundNo: string;
    fcR_ModeOfPayment: string;
    fcR_ChequeDDNo?: number;
    fcR_ChequeDDDate?: string;
    fcR_Bank?: string;
    fcR_RefundRemarks?: string;
    savetmpdata: Array<{
        fcsS_Id: number;
        fmH_Id: number;
        ftI_Id: number;
        fmG_Id: number;
        fcR_RefundAmount: number;
    }>;
    selectedRefundOverList: Array<{ fcsS_Id: number }>;
    [key: string]: any;
}

export interface ICollegeFeeRefundableOnSelectGroupPayload {
    asmaY_Id: number;
    amcsT_Id: number;
    filterrefund: string;
    multiplegroupF: number[];
}
