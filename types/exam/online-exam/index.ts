// Types for Online Exam Module

export interface IMasterQuestionOption {
    lmsmoP_Id?: number;
    lmsmQ_Id?: number;
    pamoP_Id?: number;
    pamQ_Id?: number;
    lmsmoP_Option: string;
    lmsmoP_OptionCode?: string;
    lmsmoP_OptionImage?: string | null;
    lmsmoP_OptionImageName?: string | null;
    lmsmoP_AnswerFlag: boolean;
    lmsmoP_ActiveFlg?: boolean;
    lmsmoP_Order?: number;
    [key: string]: any;
}

export interface IMasterQuestionFile {
    lmsmqF_Id?: number;
    lmsmQ_Id?: number;
    lmsmqF_FileName: string;
    lmsmqF_FilePath: string;
    lmsmqF_ActiveFlg?: boolean;
    [key: string]: any;
}

export interface IMasterQuestion {
    lmsmQ_Id?: number;
    pamQ_Id?: number;
    mI_Id?: number;
    asmaY_Id?: number;
    asmcL_Id?: number;
    asmcL_ClassName?: string;
    ismS_Id?: number;
    ismS_SubjectName?: string;
    lmsmtO_Id?: number;
    lmsmtO_TopicName?: string;
    lmsmcO_Id?: number;
    lmsmcO_ComplexityName?: string;
    lmsmQ_Question: string;
    lmsmQ_QuestionDesc?: string;
    lmsmQ_Marks: number;
    lmsmQ_QuestionType?: string; // 'MCQ' | 'Subjective' | 'TrueFalse' | 'Single'
    lmsmQ_QuestionTypeFlg?: string; // 'O' - Objective, 'S' - Subjective
    lmsmQ_ActiveFlg?: boolean;
    lmsmQ_LanguageFlg?: string;
    lmsmQ_AudioUpload?: string | null;
    lmsmQ_VideoUpload?: string | null;
    questionOptions?: IMasterQuestionOption[];
    questionFiles?: IMasterQuestionFile[];
    [key: string]: any;
}

export interface IMasterQuestionCollege extends IMasterQuestion {
    amcO_Id?: number;
    amcO_CourseName?: string;
    amB_Id?: number;
    amB_BranchName?: string;
    amsE_Id?: number;
    amsE_SEMName?: string;
    acmS_Id?: number;
    acmS_SubjectName?: string;
}

export interface IMasterComplexity {
    lmsmcO_Id?: number;
    lmsmcO_ComplexityName: string;
    lmsmcO_ComplexityDesc?: string;
    lmsmcO_ActiveFlg?: boolean;
    [key: string]: any;
}

export interface IOnlineExamConfig {
    lmsmoecfG_Id?: number;
    paoecfG_Id?: number;
    mI_Id?: number;
    asmaY_Id?: number;
    asmaY_Year?: string;
    asmcL_Id?: number;
    asmcL_ClassName?: string;
    asmS_Id?: number;
    asmC_SectionName?: string;
    ismS_Id?: number;
    ismS_SubjectName?: string;
    emE_Id?: number;
    emE_ExamName?: string;
    lmsmoecfG_TotalDuration: number; // in minutes
    lmsmoecfG_TotalQuestions: number;
    lmsmoecfG_TotalMarks: number;
    lmsmoecfG_MarksPerQuestion?: number;
    lmsmoecfG_PassPercentage?: number;
    lmsmoecfG_RandomQuestionFlg?: boolean;
    lmsmoecfG_FromDate?: string;
    lmsmoecfG_ToDate?: string;
    lmsmoecfG_StartTime?: string;
    lmsmoecfG_EndTime?: string;
    lmsmoecfG_ActiveFlg?: boolean;
    lmsmoecfG_NegativeMarksFlg?: boolean;
    lmsmoecfG_NegativeMarks?: number;
    lmsmoecfG_ResultPublishFlg?: boolean;
    [key: string]: any;
}

export interface IMasterOEExamLevel {
    lmsmoeleV_Id?: number;
    lmsmoE_Id?: number;
    lmsmoeleV_LevelName: string;
    lmsmoeleV_LevelOrder?: number;
    lmsmoeleV_NoOfQuestions?: number;
    lmsmoeleV_MarksPerQuestion?: number;
    lmsmoeleV_TotalMarks?: number;
    lmsmoeleV_ActiveFlg?: boolean;
    levelQuestions?: IMasterQuestion[];
    [key: string]: any;
}

export interface IMasterOEExam {
    lmsmoE_Id?: number;
    mI_Id?: number;
    asmaY_Id?: number;
    asmcL_Id?: number;
    ismS_Id?: number;
    emE_Id?: number;
    lmsmoE_ExamName: string;
    lmsmoE_ExamDesc?: string;
    lmsmoE_TotalQuestions: number;
    lmsmoE_TotalDuration: number;
    lmsmoE_TotalMarks: number;
    lmsmoE_PassMarks?: number;
    lmsmoE_RandomFlg?: boolean;
    lmsmoE_ActiveFlg?: boolean;
    lmsmoE_FromDate?: string;
    lmsmoE_ToDate?: string;
    examLevels?: IMasterOEExamLevel[];
    [key: string]: any;
}

export interface IExamOption {
    lmsmoP_Id: number;
    lmsmoP_Option: string;
    lmsmoP_OptionImage?: string | null;
    isSelected?: boolean;
}

export interface IExamQuestion {
    lmsmQ_Id: number;
    questionNo: number;
    lmsmQ_Question: string;
    lmsmQ_Marks: number;
    lmsmQ_QuestionTypeFlg: 'O' | 'S'; // Objective or Subjective
    lmsmQ_AudioUpload?: string | null;
    lmsmQ_VideoUpload?: string | null;
    questionFiles?: IMasterQuestionFile[];
    options: IExamOption[];
    selectedOptionId?: number | null;
    selectedOptionIds?: number[];
    subjectiveAnswerText?: string;
    subjectiveAnswerFile?: string | null;
    status: 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_marked_for_review';
}

export interface IStudentExamSession {
    studentId: number;
    studentName: string;
    admissionNo: string;
    className: string;
    sectionName: string;
    examId: number;
    examName: string;
    subjectName: string;
    totalDurationMinutes: number;
    remainingSeconds: number;
    totalQuestions: number;
    questions: IExamQuestion[];
    isSubmitted: boolean;
    scoreObtained?: number;
    totalMarks?: number;
    percentage?: number;
    resultStatus?: 'PASS' | 'FAIL' | 'PENDING_EVALUATION';
}

export interface IAnswerCorrectionStudent {
    amsT_Id: number;
    studentName: string;
    admNo: string;
    rollNo: string;
    totalQuestions: number;
    objectiveMarks: number;
    subjectiveMarks: number;
    totalMarks: number;
    isCorrected: boolean;
    answers?: {
        lmsmQ_Id: number;
        question: string;
        maxMarks: number;
        marksAwarded: number;
        studentAnswerText?: string;
        studentAnswerFile?: string;
        staffRemarks?: string;
        staffUploadFile?: string;
    }[];
    [key: string]: any;
}

export interface IOnlineExamReportRow {
    slNo?: number;
    amsT_Id: number;
    studentName: string;
    admNo: string;
    rollNo: string;
    className: string;
    sectionName: string;
    examName: string;
    subjectName: string;
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unattemptedQuestions: number;
    totalMarks: number;
    marksObtained: number;
    percentage: number;
    result: 'PASS' | 'FAIL';
    examDate?: string;
    submittedDateTime?: string;
    [key: string]: any;
}

export interface IStaffWiseExamReportRow {
    hrmE_Id: number;
    staffName: string;
    staffCode: string;
    departmentName: string;
    designationName: string;
    totalExamsCreated: number;
    totalQuestionsAdded: number;
    totalStudentsEvaluated: number;
    [key: string]: any;
}

export interface INotSubmittedStudentRow {
    amsT_Id: number;
    studentName: string;
    admNo: string;
    rollNo: string;
    className: string;
    sectionName: string;
    examName: string;
    subjectName: string;
    examDate: string;
    mobileNumber?: string;
    emailId?: string;
    reason?: string;
    [key: string]: any;
}
