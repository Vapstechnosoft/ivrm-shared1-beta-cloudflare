export interface ISubjectDropdown {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode?: string;
    selected?: boolean;
}

export interface IClassDropdown {
    asmcL_Id: number;
    asmcL_ClassName: string;
    asmcL_ClassOrder?: number;
    selected?: boolean;
}

export interface ISectionDropdown {
    asmS_Id: number;
    asmC_SectionName: string;
    asmS_SectionOrder?: number;
    selected?: boolean;
}

export interface IComplexityDropdown {
    lmsmoecX_Id: number;
    lmsmoecX_ComplexityName: string;
}

export interface ICourseDropdown {
    amcO_Id: number;
    amcO_CourseName: string;
    amcO_CourseCode?: string;
}

export interface IBranchDropdown {
    amB_Id: number;
    amB_BranchName: string;
    amB_BranchCode?: string;
}

export interface ISemesterDropdown {
    amsE_Id: number;
    amsE_SEMName: string;
    amsE_SEMCode?: string;
}

export interface IQuestionFile {
    lmsmoeqF_Id?: number;
    lmsmoeqF_FileName: string;
    lmsmoeqF_FilePath: string;
    filetype?: string;
    document_Pathnew?: string;
}

export interface IQuestionOption {
    lmsmoeqoA_Id?: number;
    lmsmoeQ_Id?: number;
    lmsmoeqoA_Option: string;
    lmsmoeqoA_OptionCode?: string;
    lmsmoeqoA_AnswerFlag: boolean;
    lmsmoeqoA_OptionImage?: string;
    lmsmoeqoA_OptionOrder?: number;
    lmsmoeqoA_Marks?: number;
    lmsmoeqoA_ActiveFlag?: boolean;
}

export interface IMasterQuestionList {
    lmsmoeQ_Id: number;
    mI_Id?: number;
    ismS_Id: number;
    ismS_SubjectName?: string;
    lmsmoeQ_Question: string;
    lmsmoeQ_QuestionDesc?: string;
    lmsmoeQ_Marks: number;
    lmsmoecX_Id?: number;
    lmsmoecX_ComplexityName?: string;
    lmsmoeQ_ActiveFlg: boolean;
    lmsmoeQ_TotalMarks?: number;
    createdDate?: string;
    updatedDate?: string;
    questionFiles?: IQuestionFile[];
    questionOptions?: IQuestionOption[];
    classList?: {
        asmcL_Id: number;
        asmcL_ClassName: string;
        asmS_Id?: number;
        asmC_SectionName?: string;
    }[];
}

export interface IMasterQuestionCollegeList {
    lmsmcQ_Id: number;
    mI_Id?: number;
    amcO_Id: number;
    amcO_CourseName?: string;
    amB_Id: number;
    amB_BranchName?: string;
    amsE_Id: number;
    amsE_SEMName?: string;
    ismS_Id: number;
    ismS_SubjectName?: string;
    lmsmcQ_Question: string;
    lmsmcQ_QuestionDesc?: string;
    lmsmcQ_Marks: number;
    lmsmoecX_Id?: number;
    lmsmoecX_ComplexityName?: string;
    lmsmcQ_ActiveFlg: boolean;
    createdDate?: string;
    updatedDate?: string;
    questionFiles?: IQuestionFile[];
    questionOptions?: IQuestionOption[];
    branchList?: {
        amcO_Id: number;
        amB_Id: number;
        amsE_Id: number;
        amcO_CourseName?: string;
        amB_BranchName?: string;
        amsE_SEMName?: string;
    }[];
}

export interface IMasterQuestionInitialData {
    getSubjects: ISubjectDropdown[];
    getClass: IClassDropdown[];
    getSection?: ISectionDropdown[];
    getComplexity?: IComplexityDropdown[];
    questionList: IMasterQuestionList[];
}

export interface IMasterQuestionCollegeInitialData {
    getCourse: ICourseDropdown[];
    getBranch: IBranchDropdown[];
    getSemester: ISemesterDropdown[];
    getSubjects: ISubjectDropdown[];
    getComplexity?: IComplexityDropdown[];
    questionList: IMasterQuestionCollegeList[];
}

export interface IMasterComplexity {
    lpmcomP_Id: number;
    lpmcomP_ComplexityName: string;
    lpmcomP_ComplexityDesc?: string;
    lpmcomP_DefaultFlg?: boolean;
    lpmcomP_ActiveFlg: boolean;
    lpmcomP_CreatedDate?: string;
    lpmcomP_UpdatedDate?: string;
}

export interface IMasterComplexityInitialData {
    getMasterComplexitiesdetails: IMasterComplexity[];
}
