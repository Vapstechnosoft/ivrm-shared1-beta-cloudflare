export interface ICollegeFeeChequeBounceGrid {
    fccB_Id: number;
    asmaY_Id?: number;
    asmaY_Year?: string;
    fccB_Date?: string;
    amcsT_Id?: number;
    amcsT_FirstName?: string;
    fyP_Id?: number;
    fyP_ReceiptNo?: string;
    fccB_Amount?: number;
    fccB_Remarks?: string;
    [key: string]: any;
}

export interface ICollegeFeeChequeBounceAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order?: number;
    is_Active?: boolean;
    [key: string]: any;
}

export interface ICollegeFeeChequeBounceCourse {
    amcO_Id: number;
    amcO_CourseName: string;
    amcO_CourseCode?: string;
    [key: string]: any;
}

export interface ICollegeFeeChequeBounceBranch {
    amB_Id: number;
    amB_BranchName: string;
    amB_BranchCode?: string;
    [key: string]: any;
}

export interface ICollegeFeeChequeBounceSemester {
    amsE_Id: number;
    amsE_SEMName: string;
    amsE_SEMCode?: string;
    [key: string]: any;
}

export interface ICollegeFeeChequeBounceStudent {
    amcsT_Id: number;
    amcsT_FirstName: string;
    amcsT_MiddleName?: string;
    amcsT_LastName?: string;
    amcsT_AdmNo?: string;
    [key: string]: any;
}

export interface ICollegeFeeChequeBounceReceipt {
    fyP_Id: number;
    fyP_ReceiptNo: string;
    fyP_Date?: string;
    fyP_TotAmount?: number;
    [key: string]: any;
}

export interface ICollegeFeeChequeBounceSavePayload {
    fccB_Id: number;
    asmaY_Id: number;
    amcsT_Id: number;
    fyP_Id: number;
    fccB_Date: string;
    fccB_Remarks: string;
    [key: string]: any;
}

export interface ICollegeFeeChequeBounceAllDetailsResponse {
    yearlist?: ICollegeFeeChequeBounceAcademicYear[];
    alldata?: ICollegeFeeChequeBounceGrid[];
    saveddata?: ICollegeFeeChequeBounceGrid[];
    [key: string]: any;
}
