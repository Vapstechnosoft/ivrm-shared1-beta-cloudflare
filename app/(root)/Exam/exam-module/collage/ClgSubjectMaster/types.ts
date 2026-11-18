export interface IClgMasterSubject {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_IVRSSubjectName?: string;
    ismS_SubjectCode?: string;
    ismS_SubjectNameNew?: string;
    ismS_SubjectFlag?: string | number;
    ismS_Max_Marks?: number | string;
    ismS_Min_Marks?: number | string;
    ismS_PreadmFlag?: number | boolean;
    ismS_AttendanceFlag?: number | boolean;
    ismS_BatchAppl?: number | boolean;
    ismS_TTFlag?: number | boolean;
    ismS_ExamFlag?: number | boolean;
    ismS_LanguageFlg?: number | boolean;
    ismS_AtExtraFeeFlg?: number | boolean;
    ismS_ActiveFlag?: number;
    ismS_OrderFlag?: number;
}

export interface IClgCourse {
    amcO_Id: number;
    amcO_CourseName: string;
    Selected?: boolean;
}

export interface IClgBranch {
    amB_Id: number;
    amB_BranchName: string;
    select?: boolean;
}

export interface IClgSubjectDropdownItem {
    ismS_Id: number;
    ismS_SubjectName: string;
    Selected?: boolean;
}

export interface IClgYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IClgIntroYear {
    yearid: number | string;
    yearname: string;
}

export interface IClgSubjectMapping {
    amcO_CourseName: string;
    amB_BranchName: string;
    ismS_SubjectName: string;
    ismS_SubjectCode: string;
    ismS_IntroYear?: string | number;
    ismS_DiscontinuedYear?: string | number;
}

export interface IClgSubjectOrder {
    id: number;
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode: string;
    ismS_OrderFlag?: number;
    ismS_PreadmFlag?: number;
    ismS_SubjectFlag?: string | number;
}

export interface IClgSubjectMasterInitialData {
    subject_m_list: IClgMasterSubject[];
    subject_m_list_new: IClgMasterSubject[];
    courst_list: IClgCourse[];
    branch_list: IClgBranch[];
    sub_list: IClgSubjectDropdownItem[];
    year_list: IClgYear[];
    yearOfintro: IClgIntroYear[];
    mappinglistdata: IClgSubjectMapping[];
}
