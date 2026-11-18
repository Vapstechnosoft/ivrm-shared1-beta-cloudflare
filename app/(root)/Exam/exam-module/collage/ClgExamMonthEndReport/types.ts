export interface IClgAcademicYear {
    asmaY_Id?: number;
    asmaY_Year?: string;
    ASMAY_Id?: number;
    ASMAY_Year?: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface IClgMonth {
    ivrM_Month_Id?: number;
    ivrM_Month_Name?: string;
    IVRM_Month_Id?: number;
    IVRM_Month_Name?: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface IClgExam {
    emE_Id?: number;
    emE_ExamName?: string;
    EME_Id?: number;
    EME_ExamName?: string;
    examName?: string;
    name?: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface IClgExamMonthEndReportInitialData {
    acdlist?: IClgAcademicYear[];
    monthlist?: IClgMonth[];
    examlist?: IClgExam[];
}

export interface IClgExamMonthEndReportItem {
    asmcL_ClassName?: string;
    className?: string;
    courseName?: string;
    pass: number | string;
    fail: number | string;
    total?: number;
    passPercentage?: number;
}

export interface IClgExamMonthEndReportPayload {
    ASMAY_Id: number;
    EME_Id: number;
    IVRM_Month_Id: number;
}

export interface IClgExamMonthEndReportApiResponse {
    acdlist?: IClgAcademicYear[];
    monthlist?: IClgMonth[];
    examlist?: IClgExam[];
    datareport?: IClgExamMonthEndReportItem[];
    [key: string]: any;
}

export interface ClgExamMonthEndReportFormValues {
    ASMAY_Id: string;
    IVRM_Month_Id: string;
    EME_Id: string;
}
