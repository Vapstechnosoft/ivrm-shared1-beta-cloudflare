export interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    Selected?: boolean;
    asmaY_Order?: number;
}

export interface ICollegeCourse {
    amcO_Id: number;
    amcO_CourseName: string;
    amcO_CourseCode?: string;
    Selected?: boolean;
}

export interface ICollegeBranch {
    amB_Id: number;
    amB_BranchName: string;
    amB_BranchCode?: string;
    selected?: boolean;
    Selected?: boolean;
}

export interface ICollegeSemester {
    amsE_Id: number;
    amsE_SEMName: string;
    amsE_SEMCode?: string;
    Selected?: boolean;
}

export interface ICollegeSection {
    acmS_Id: number;
    acmS_SectionName: string;
    acmS_SectionCode?: string;
    selected?: boolean;
    Selected?: boolean;
}

export interface ICollegeExam {
    emE_Id: number;
    emE_ExamName: string;
    emE_ExamCode?: string;
    Selected?: boolean;
}

export interface ICollegeSubject {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode: string;
    Selected?: boolean;
}

export interface ISubjectScheme {
    acsS_Id: number;
    acsS_SchmeName: string;
    Selected?: boolean;
}

export interface ISchemeType {
    acsT_Id: number;
    acsT_SchmeType: string;
    Selected?: boolean;
}

export interface IExamConfiguration {
    exmConfig_AdmnoColumnDisplay?: boolean;
    exmConfig_RegnoColumnDisplay?: boolean;
    exmConfig_RollnoColumnDisplay?: boolean;
    exmConfig_RoundoffFlag?: boolean;
}

export interface IStudentMarksRecord {
    amcsT_Id?: number;
    amsT_Id?: number;
    studentname: string;
    amcsT_AdmNo?: string;
    amcsT_RegistrationNo?: string;
    acysT_RollNo?: string | number;
    totalMarks: number;
    minMarks: number;
    marksEnterFor: number;
    obtainmarks: string | number;
    estmS_Marks?: number;
    estmS_Grade?: string;
    estmS_Flg?: string;
    [key: string]: any;
}

export interface IClgMarksEntryInitialDataResponse {
    getyear?: IAcademicYear[];
    yearlist?: IAcademicYear[];
    [key: string]: any;
}

export interface IClgMarksEntryCoursesResponse {
    courseslist?: ICollegeCourse[];
    [key: string]: any;
}

export interface IClgMarksEntryBranchesResponse {
    branchlist?: ICollegeBranch[];
    [key: string]: any;
}

export interface IClgMarksEntrySemestersResponse {
    semisters?: ICollegeSemester[];
    semisters_list?: ICollegeSemester[];
    [key: string]: any;
}

export interface IClgMarksEntryExamsResponse {
    examlist?: ICollegeExam[];
    sectionlist?: ICollegeSection[];
    subjectgrplist?: any[];
    [key: string]: any;
}

export interface IClgMarksEntrySubjectsResponse {
    subjectgroups?: ICollegeSubject[];
    subject_list?: ICollegeSubject[];
    [key: string]: any;
}

export interface IClgMarksEntrySubjectSchemeResponse {
    getsubjectschemetype?: ISubjectScheme[];
    subjectsheme?: ISubjectScheme[];
    [key: string]: any;
}

export interface IClgMarksEntrySchemeTypeResponse {
    getschemetype?: ISchemeType[];
    subjectshemetype?: ISchemeType[];
    [key: string]: any;
}

export interface IClgMarksEntrySearchResponse {
    subMorGFlag?: 'M' | 'G' | string;
    gradname?: string[];
    configuration?: IExamConfiguration[];
    studentList?: IStudentMarksRecord[];
    marksdeleteflag?: string | boolean;
    [key: string]: any;
}

export interface IClgMarksEntrySavePayload {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMSE_Id: number;
    markssection: { ACMS_Id: number }[];
    marksbranch: { AMB_Id: number }[];
    EME_Id: number;
    ISMS_Id: number;
    ACSS_Id: number;
    ACST_Id: number;
    marksdeleteflag?: string | boolean;
    detailsList: IStudentMarksRecord[];
    message?: string;
}

export interface IClgMarksEntrySaveResponse {
    messagesaveupdate?: string;
    returnval?: boolean;
    [key: string]: any;
}
