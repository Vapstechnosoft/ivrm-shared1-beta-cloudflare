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

export interface ICollegeSubject {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode?: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface IReportHeaderInst {
    mI_Name?: string;
    mI_Address1?: string;
    mI_Address2?: string;
    mI_Address3?: string;
    mI_Pincode?: string;
    [key: string]: any;
}

export interface IReportConfig {
    exmConfig_RegnoColumnDisplay?: boolean;
    exmConfig_AdmnoColumnDisplay?: boolean;
    exmConfig_RollnoColumnDisplay?: boolean;
    [key: string]: any;
}

export interface IIndStudentRecord {
    STUDENTNAME?: string;
    AMST_AdmNo?: string;
    REGNO?: string;
    ECSTMPS_ObtainedMarks?: number | string;
    ECSTMPS_PassFailFlg?: string;
    ASA_ClassHeld?: number | string;
    ASA_Class_Attended?: number | string;
    att_percentage?: number | string;
    ecyseS_MaxMarks?: number | string;
    [key: string]: any;
}

export interface IIndReportPayload {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMS_Id: number;
    ACSS_Id: number;
    ACST_Id: number;
    ISMS_Id: number;
    EME_Id: number;
}

export interface IGetDetailsResponse {
    getyear?: IAcademicYear[];
    [key: string]: any;
}

export interface IOnChangeYearResponse {
    getcourse?: ICollegeCourse[];
    [key: string]: any;
}

export interface IOnChangeCourseResponse {
    getbranch?: ICollegeBranch[];
    [key: string]: any;
}

export interface IOnChangeBranchResponse {
    getsemester?: ICollegeSemester[];
    [key: string]: any;
}

export interface IOnChangeSemesterResponse {
    getsection?: ICollegeSection[];
    subjectshemalist?: ISubjectScheme[];
    [key: string]: any;
}

export interface IOnChangeSubjectSchemeResponse {
    schmetypelist?: ISchemeType[];
    [key: string]: any;
}

export interface IOnChangeSchemeTypeResponse {
    getexam?: ICollegeExam[];
    getsubject?: ICollegeSubject[];
    [key: string]: any;
}

export interface IIndReportResponse {
    reportinddata?: IIndStudentRecord[];
    configuration?: IReportConfig[];
    instname?: IReportHeaderInst[];
    [key: string]: any;
}
