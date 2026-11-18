// academicyear
export interface IFeeIncomeTaxAcademicYearDropdownList {
    asmaY_Id: number;
    asmaY_Year: string;
}

// class
export interface IFeeIncomeTaxClassDropdownList {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

// section
export interface IFeeIncomeTaxSectionDropdownList {
    asmC_Id: number;
    asmC_SectionName: string;
}

// student
export interface IFeeIncomeTaxStudentDropdownList {
    amst_Id: number;
    studentName: string;
    amst_AdmNo: string;
}

// report result
export interface IFeeIncomeTaxReportResult {
    fmH_Id: number;
    fmH_HeadName: string;
    amsT_AdmNo: string;
    studentName: string;
    amsT_FatherName: string;
    amsT_MotherName: string;
    className: string;
    sectionName: string;
    academicYear: string;
    totalPaidAmount: number;
    Words?: string;
}

// payload for section
export interface IFeeIncomeTaxSectionPayload {
    asmaY_Id: number;
    asmcL_Id: number;
}

// payload for student
export interface IFeeIncomeTaxStudentPayload {
    asmaY_Id: number;
    asmcL_Id: number;
    amsC_Id: number;
}

// payload for report
export interface IFeeIncomeTaxReportPayload {
    asmaY_Id: number;
    asmcL_Id: number;
    amsC_Id: number;
    amsT_Id: number;
}
