export interface IAcademicYearDropdown {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IClassDropdown {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface ISectionDropdown {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface ISubjectDropdown {
    ismS_Id: number;
    ismS_SubjectName: string;
}

export interface IExamDropdown {
    lpmoeeX_Id: number;
    lpmoeeX_ExamName: string;
}

export interface IStudentExamSubmission {
    amsT_Id: number;
    studentName: string;
    admNo: string;
    rollNo: string | number;
    classname?: string;
    sectionname?: string;
    totalQuestions: number;
    totalAttempted: number;
    totalCorrect: number;
    totalWrong: number;
    totalMarks: number;
    marksObtained: number;
    percentage: number;
    examStatus: 'Not Started' | 'In Progress' | 'Submitted' | 'Evaluated';
    submittedDateTime?: string;
    isPublished?: boolean;
    publishDate?: string;
}

export interface IStudentAnswerSheetQuestion {
    questionId: number;
    questionText: string;
    questionMarks: number;
    complexityLevel?: string;
    questionFiles?: { fileName: string; filePath: string }[];
    options: {
        optionId: number;
        optionText: string;
        isCorrect: boolean;
        isStudentSelected: boolean;
        optionImage?: string;
    }[];
    studentDescriptiveAnswer?: string;
    awardedMarks: number;
    teacherRemarks?: string;
}

export interface IStudentEvaluationDetails {
    studentInfo: IStudentExamSubmission;
    questions: IStudentAnswerSheetQuestion[];
}

export interface IAnswerPaperInitialData {
    yearList: IAcademicYearDropdown[];
    classList: IClassDropdown[];
    sectionList: ISectionDropdown[];
    subjectList: ISubjectDropdown[];
    examList: IExamDropdown[];
    studentSubmissions?: IStudentExamSubmission[];
}

export interface IPublishToStudentList {
    amsT_Id: number;
    studentName: string;
    admNo: string;
    rollNo: string | number;
    className: string;
    sectionName: string;
    examName: string;
    subjectName: string;
    totalMarks: number;
    marksObtained: number;
    percentage: number;
    resultStatus: 'Pass' | 'Fail';
    isPublished: boolean;
    publishedDate?: string;
}

export interface IPublishInitialData {
    yearList: IAcademicYearDropdown[];
    classList: IClassDropdown[];
    sectionList: ISectionDropdown[];
    subjectList: ISubjectDropdown[];
    examList: IExamDropdown[];
    studentList?: IPublishToStudentList[];
}
