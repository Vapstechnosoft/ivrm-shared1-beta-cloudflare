export interface IClgBatch {
    acmB_Id: number;
    acmsN_SessionName: string;
    acmnS_Order?: number;
    asmaY_Id?: number;
}

export interface IClgCourse {
    amcO_Id: number;
    amcO_CourseName: string;
    amcO_CourseCode?: string;
    amcO_Order?: number;
}

export interface IClgBranch {
    amB_Id: number;
    amB_BranchName: string;
    amB_BranchCode?: string;
    amcO_Id?: number;
    amB_Order?: number;
}

export interface IClgSemester {
    amsE_Id: number;
    amsE_SEMName: string;
    amsE_SEMOrder?: number;
    amsE_SEMCode?: string;
}

export interface IClgStudentItem {
    amcsT_Id: number;
    amcsT_FirstName: string;
    amcsT_MiddleName?: string | null;
    amcsT_LastName?: string | null;
    studentName: string;
    amcsT_AdmNo: string;
    amcsT_RegistrationNo?: string;
    amcO_Id?: number;
    amcO_CourseName: string;
    amB_Id?: number;
    amB_BranchName: string;
    amsE_Id?: number;
    amsE_SEMName: string;
    displayName: string;
    applicableFee?: number;
    existingLoanAmount?: number;
    existingScholarshipAmount?: number;
}

export interface IClgLoanScholarshipEntry {
    amcsT_Id: number;
    studentName: string;
    amcsT_AdmNo: string;
    courseBranchSem: string;
    applicableFee: number;
    loanAmount: number;
    scholarshipAmount: number;
    totalDeduction: number;
    netPayable: number;
    remarks: string;
}

export interface IClgLoanScholarshipRecord {
    fcL_Id: number;
    acmB_Id: number;
    batchName?: string;
    amcsT_Id: number;
    studentName: string;
    amcsT_AdmNo: string;
    amcO_CourseName: string;
    amB_BranchName: string;
    amsE_SEMName: string;
    loanAmount: number;
    scholarshipAmount: number;
    totalAmount: number;
    createdDate: string;
    remarks?: string;
    status?: string;
}

export interface IClgLoanScholarshipSavePayload {
    acmB_Id: number;
    studentEntries: {
        amcsT_Id: number;
        loanAmount: number;
        scholarshipAmount: number;
        remarks?: string;
    }[];
}
