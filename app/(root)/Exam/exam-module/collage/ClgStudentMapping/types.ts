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

export interface ISubjectGroup {
    emG_Id: number;
    emG_GroupName: string;
    emG_MaxAplSubjects?: number;
    emG_MinAplSubjects?: number;
    Selected?: boolean;
    [key: string]: any;
}

export interface IGroupSubject {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode?: string;
    [key: string]: any;
}

export interface ISubjectCheckboxItem {
    id: number;
    name: string;
    abc: boolean;
}

export interface ISelectedSubjectItem {
    id: number;
    name: string;
    abc?: boolean;
}

export interface IStudentDetailRecord {
    amcsT_Id: number;
    ismS_Id: number;
    [key: string]: any;
}

export interface IStudentRawItem {
    amcsT_Id: number;
    amcsT_Name: string;
    amcsT_AdmNo: string;
    amcsT_RegistrationNo: string;
    [key: string]: any;
}

export interface IStudentMappingRow {
    amcsT_Id: number;
    amcsT_Name: string;
    amcsT_AdmNo: string;
    amcsT_RegistrationNo: string;
    sub_list: ISelectedSubjectItem[];
    xyz: boolean; // Selected student row checkbox
    sub_list_view: ISubjectCheckboxItem[];
}

export interface IGetDetailsResponse {
    yearlist?: IAcademicYear[];
    courseslist?: ICollegeCourse[];
    branchlist?: ICollegeBranch[];
    semisters?: ICollegeSemester[];
    sections?: ICollegeSection[];
    subjectgrplist?: ISubjectGroup[];
    [key: string]: any;
}

export interface IGetCourseResponse {
    courseslist?: ICollegeCourse[];
    [key: string]: any;
}

export interface IGetBranchResponse {
    branchlist?: ICollegeBranch[];
    [key: string]: any;
}

export interface IGetSemesterResponse {
    semisters?: ICollegeSemester[];
    [key: string]: any;
}

export interface IGetSectionResponse {
    sections?: ICollegeSection[];
    subjectgrplist?: ISubjectGroup[];
    [key: string]: any;
}

export interface IStudentDetailsSearchPayload {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    ACMS_Id: number;
    AMSE_Id: number;
    EMG_Id: number;
}

export interface IStudentDetailsResponse {
    studlist?: IStudentRawItem[];
    allsubject_list?: IGroupSubject[];
    allstudent_details?: IStudentDetailRecord[];
    [key: string]: any;
}

export interface ISaveMappingPayload {
    ECSTSU_Id?: number;
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    ACMS_Id: number;
    AMSE_Id: number;
    EMG_Id: number;
    get_list: IStudentMappingRow[];
}

export interface ISaveMappingResponse {
    returnval?: boolean;
    returnduplicatestatus?: boolean;
    message?: string;
    [key: string]: any;
}
