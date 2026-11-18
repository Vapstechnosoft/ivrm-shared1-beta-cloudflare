export interface IClgPreadmissionStatusFilter {
    asmaY_Id: number;
    amcO_Id: number;
    pamsT_Id: number;
    status_type: 'Appsts' | 'admsts';
}

export interface IClgPreadmissionStudent {
    pacA_Id: number;
    name: string;
    pacA_RegistrationNo: string;
    pacA_ApplStatus?: number;
    pacA_AdmStatus?: number;
    statusName?: string;
    pamsT_Id?: number;
    pacA_Statusremark?: string;
    remarkcount?: number;
    amcO_CourseName?: string;
    pacA_Sex?: string;
    fee_status?: string;
    ispaC_ApplFeeFlag?: number;
    selected?: boolean;
}

export interface IClgPreadmissionStatusUpdate {
    studentlist: IClgPreadmissionStudent[];
    Student_status: number | string;
    email?: boolean;
    sms?: boolean;
    default?: boolean;
    MailSubject?: string;
    MailHeader?: string;
    Parameter_email?: string;
    MailFooter?: string;
    smscontent?: string;
    otptype?: string;
    forgetEmailOTP?: string;
}

export interface IClgSectionAllotmentStudent {
    amsT_Id?: number;
    amcsT_Id?: number;
    acysT_Id?: number;
    AMST_Id?: number;
    amcsT_FirstName?: string;
    amcsT_MiddleName?: string;
    amcsT_LastName?: string;
    amcsT_AdmNo?: string;
    studentName?: string;
    amcO_CourseName?: string;
    amB_BranchName?: string;
    amsE_SEMName?: string;
    acmS_SectionName?: string;
    acysT_RollNo?: string | number;
    pdays?: string | number;
    Selected?: boolean;
    Selected1?: boolean;
    Selected_CS?: boolean;
    Selected1_CS?: boolean;
    Selected_PS?: boolean;
    Selected1_PS?: boolean;
    Selected_YS?: boolean;
    selectedAll1_YS?: boolean;
}

export interface IChangedCourseBranchItem {
    years?: string;
    asmaY_Year?: string;
    old_CourseName?: string;
    old_BranchName?: string;
    old_SEMName?: string;
    New_CourseName?: string;
    New_BranchName?: string;
    new_SEMName?: string;
    Student_Name?: string;
    studentName?: string;
    amcsT_AdmNo?: string;
    amcsT_FirstName?: string;
    amcsT_LastName?: string;
    amcsT_MiddleName?: string;
}

export interface ISaveCourseBranchChangePayload {
    ASMAY_Id: number;
    AMCO_Id_Old: number;
    AMB_Id_Old: number;
    ASME_Id_Old: number;
    AMCO_Id_New: number;
    AMB_Id_New: number;
    AMCST_Id: number;
    asmaY_Id?: number;
    amcO_Id_Old?: number;
    amB_Id_Old?: number;
    amsE_Id_Old?: number;
    amcO_Id_New?: number;
    amB_Id_New?: number;
    amcsT_Id?: number;
}

