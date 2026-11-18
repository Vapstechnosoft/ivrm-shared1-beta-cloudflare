export interface ICollegeFeeTransaction {
    fyp_Id: number;
    amcst_Id: number;
    amcst_FirstName: string;
    amcst_MiddleName?: string | null;
    amcst_LastName?: string | null;
    studentName?: string;
    amco_CourseName: string;
    amB_BranchName: string;
    amsE_SEMName?: string;
    amcst_AdmNo: string;
    amcst_RegistrationNo?: string;
    fyp_Receipt_No: string;
    fyp_Date: string;
    fyp_Tot_Amount: number;
    fyp_Bank_Or_Cash: string;
    fyp_Transaction_Type_Flag?: string;
    fyp_Chq_Bounce?: string | null;
    status?: string;
    mI_Id?: number;
    asmaY_Id?: number;
    [key: string]: any;
}

export interface ICollegeStudentSearchList {
    amcst_Id: number;
    amcst_StudentName: string;
    amcst_FirstName?: string;
    amcst_MiddleName?: string;
    amcst_LastName?: string;
    amcst_AdmNo: string;
    amcst_RegistrationNo?: string;
    amco_CourseName: string;
    amB_BranchName: string;
    amsE_SEMName?: string;
    amcst_SOL?: string;
    amcst_Mobile?: string;
    amcst_FatherName?: string;
}

export interface ICollegeStudentDetails {
    amcst_Id: number;
    amcst_FirstName: string;
    amcst_MiddleName?: string | null;
    amcst_LastName?: string | null;
    amcst_AdmNo: string;
    amcst_RegistrationNo?: string;
    amco_CourseName: string;
    amB_BranchName: string;
    amsE_SEMName?: string;
    amcst_Mobile?: string;
    amcst_FatherName?: string;
    amcst_Photoname?: string;
    portalusername?: string;
    [key: string]: any;
}

export interface ICollegeFeeGroupTerm {
    fmg_Id: number;
    fmg_GroupName: string;
    fmt_Id: number;
    fmt_Name: string;
    disablepaisterms?: boolean;
    checked?: boolean;
}

export interface ICollegeFeeHeadDetails {
    fma_Id: number;
    fmh_Id: number;
    fmh_FeeName: string;
    fti_Id: number;
    fti_Name: string;
    fmg_Id: number;
    fmg_GroupName?: string;
    fma_Amount: number;
    totalamount?: number;
    concession?: number;
    fine?: number;
    due?: number;
    payableAmount?: number;
    nowPaying: number;
    checked?: boolean;
}

export interface ICollegePaymentMode {
    ivrmmoD_Id: number;
    ivrmmoD_ModeOfPayment: string;
    ivrmmoD_Flag: string; // 'C' | 'B'
    Bank_Date?: string;
    Bank_No?: string;
    Bank_Name?: string;
    Bank_Amount?: number;
}

export interface ICollegeNarration {
    fmnaR_Id: number;
    fmnaR_Narration: string;
}

export interface ICollegeMasterBank {
    fmb_Id: number;
    fmb_BankName: string;
}
