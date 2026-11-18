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

export interface ICollegeExam {
    emE_Id: number;
    emE_ExamName: string;
    Selected?: boolean;
    [key: string]: any;
}

export interface IFeedbackOption {
    fmoP_Id: number;
    fmtY_Id?: number;
    fmqE_Id?: number;
    fmoP_FeedbackOptions: string;
    fmoP_OptionsValue?: string | number;
    [key: string]: any;
}

export interface IFeedbackQuestion {
    fmqE_Id: number;
    fmtY_Id: number;
    fmqE_FeedbackQuestions: string;
    fmqE_FeedbackQRemarks?: string;
    fmtY_FeedbackTypeName?: string;
    feedbackoptiondata?: IFeedbackOption[];
    name?: number; // selected option ID
    fsttR_FeedBack?: string; // remarks text
    [key: string]: any;
}

export interface IGetDetailsResponse {
    yearlist?: IAcademicYear[];
    courseslist?: ICollegeCourse[];
    semesters?: ICollegeSemester[];
    branchlist?: ICollegeBranch[];
    examlist?: ICollegeExam[];
    sectionlist?: ICollegeSection[];
    [key: string]: any;
}

export interface ICalculationPayload {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    ACMS_Id: number;
    AMSE_Id: number;
    EME_Id: number;
}

export interface ICalculationResponse {
    returnval?: boolean;
    message?: string;
    [key: string]: any;
}

export interface ILoadFeedbackResponse {
    feedbackquestion?: IFeedbackQuestion[];
    feedbackoption?: IFeedbackOption[];
    [key: string]: any;
}

export interface ISaveFeedbackItem {
    name: number;
    FMOP_FeedbackOptions: string;
    FMOP_OptionsValue?: string | number;
    FMTY_Id: number;
    FMQE_Id: number;
    FMQE_FeedbackQuestions: string;
    FMQE_FeedbackQRemarks?: string;
    FMTY_FeedbackTypeName?: string;
    FSTTR_FeedBack?: string;
}

export interface ISaveFeedbackPayload {
    savemodulefeedback: ISaveFeedbackItem[];
}
