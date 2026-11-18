export interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface ICollegeCourse {
    amcO_Id: number;
    amcO_CourseName: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface ICollegeBranch {
    amB_Id: number;
    amB_BranchName: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface ICollegeSemester {
    amsE_Id: number;
    amsE_SEMName: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface ICollegeSection {
    acmS_Id: number;
    acmS_SectionName: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface ISubjectScheme {
    acsS_Id: number;
    acsS_SchmeName: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface ISchemeType {
    acsT_Id: number;
    acsT_SchmeType: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface ICollegeExam {
    emE_Id: number;
    emE_ExamName: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface IStudentCheckboxItem {
    amscT_Id: number;
    studentname: string;
    checkedsub?: boolean;
    [key: string]: any;
}

export interface ISubjectReportItem {
    AMCST_Id: number;
    ISMS_Id: number;
    ISMS_SubjectName: string;
    ISMS_SubjectCode?: string;
    ECYSES_AplResultFlg?: boolean;
    ECSTMPS_MaxMarks?: number | string;
    ECSTMPS_ObtainedMarks?: number | string;
    ECSTMPS_ObtainedGrade?: string;
    ECSTMPS_SemAverage?: number | string;
    ECSTMPS_SectionAverage?: number | string;
    ECSTMPS_SemHighest?: number | string;
    ECSTMPS_SectionHighest?: number | string;
    ECSTMPS_PassFailFlg?: string;
}

export interface IAttendanceMonthlyItem {
    AMCST_Id: number;
    May?: number | string;
    June?: number | string;
    July?: number | string;
    August?: number | string;
    September?: number | string;
    October?: number | string;
    November?: number | string;
    December?: number | string;
    January?: number | string;
    Febrauary?: number | string;
    March?: number | string;
    April?: number | string;
    TotalWorkingDays?: number | string;
    TotalPresentDays?: number | string;
    Total_Percentage?: number | string;
    [key: string]: any;
}

export interface IStudentRecordRaw {
    AMCST_Id: number;
    StudentName: string;
    AMCST_RegistrationNo: string;
    AMCST_AdmNo?: string;
    EME_ExamName?: string;
    AMCO_CourseName?: string;
    AMB_BranchName?: string;
    AMSE_SEMName?: string;
    ACMS_SectionName?: string;
    ECSTMP_TotalObtMarks?: number | string;
    ECSTMP_Percentage?: number | string;
    ECSTMP_TotalGrade?: string;
    ECSTMP_SectionRank?: string | number;
    ECSTMP_SemRank?: string | number;
    ECSTMP_TotalMaxMarks?: number | string;
    ECSTMP_Result?: string;
    [key: string]: any;
}

export interface IStudentProgressCard {
    AMCST_Id: number;
    StudentName: string;
    AMCST_RegistrationNo: string;
    AMCST_AdmNo?: string;
    EME_ExamName?: string;
    AMCO_CourseName?: string;
    AMB_BranchName?: string;
    AMSE_SEMName?: string;
    ACMS_SectionName?: string;
    ECSTMP_TotalObtMarks?: number | string;
    ECSTMP_Percentage?: number | string;
    ECSTMP_TotalGrade?: string;
    ECSTMP_SectionRank?: string | number;
    ECSTMP_SemRank?: string | number;
    ECSTMP_TotalMaxMarks?: number | string;
    ECSTMP_Result?: string;
    subject: ISubjectReportItem[];
}

export interface IGetDetailsResponse {
    yearlist?: IAcademicYear[];
    [key: string]: any;
}

export interface IOnChangeYearResponse {
    courseslist?: ICollegeCourse[];
    [key: string]: any;
}

export interface IOnChangeCourseResponse {
    branchlist?: ICollegeBranch[];
    [key: string]: any;
}

export interface IOnChangeBranchResponse {
    semisters?: ICollegeSemester[];
    [key: string]: any;
}

export interface IOnChangeSemesterResponse {
    sections?: ICollegeSection[];
    subjectshemalist?: ISubjectScheme[];
    [key: string]: any;
}

export interface IOnChangeSubjectSchemeResponse {
    schmetypelist?: ISchemeType[];
    [key: string]: any;
}

export interface IOnChangeSchemeTypeResponse {
    exmstdlist?: ICollegeExam[];
    studentlist?: IStudentCheckboxItem[];
    [key: string]: any;
}

export interface IProgressCardPayload {
    EME_ID: number;
    AMCO_Id: number;
    AMB_Id: number;
    ACSS_Id: number;
    ACST_Id: number;
    ACMS_Id: number;
    AMSE_Id: number;
    ASMAY_Id: number;
    Studentlist_temp: { AMCST_Id: number }[];
}

export interface IProgressCardResponse {
    getProgressCardReportList?: (IStudentRecordRaw & ISubjectReportItem)[];
    work_attendence?: IAttendanceMonthlyItem[];
    present_attendence?: IAttendanceMonthlyItem[];
    [key: string]: any;
}
