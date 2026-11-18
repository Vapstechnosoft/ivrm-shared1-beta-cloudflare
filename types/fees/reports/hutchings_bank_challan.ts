export interface IHutchingsBankChallanRequest {
    ASMAY_Id: number;
    AMST_Id: number;
    termIds: number[];
}

export interface IHutchingsBankChallanTerm {
    fmt_Id: number;
    fmt_Name: string;
    selected?: boolean;
}

export interface IHutchingsBankChallanStudent {
    amst_Id: number;
    amsT_StudentName: string;
}

export interface IHutchingsBankChallanItem {
    slNo?: number;
    studentName: string;
    className: string;
    sectionName: string;
    admNo: string;
    challanNo: string;
    downloadDate: string;
    amount: number;
    termNames?: string;
    amst_Id?: number;
    asmay_Year?: string;
}

export interface IHutchingsBankChallanOnloadResponse {
    success: boolean;
    message?: string;
    academicYears?: { asmaY_Id: number; asmaY_Year: string }[];
    studentList?: IHutchingsBankChallanStudent[];
    termList?: IHutchingsBankChallanTerm[];
    challanList?: IHutchingsBankChallanItem[];
}
