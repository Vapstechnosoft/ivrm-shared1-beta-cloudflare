export interface AcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
}

export interface Subject {
    ismS_Id: number;
    ismS_SubjectName: string;
}

export interface ExamGrade {
    emE_Id: number;
    emE_ExamName: string;
    estmpS_MaxMarks: number;
    estmpS_ObtainedMarks: number;
    estmpS_ObtainedGrade: string;
}

export interface CumulativeSubjectLoadData {
    stuyearlist: AcademicYear[];
}

export interface SubjectListResponse {
    subjectlist: Subject[];
    stuyearlist: AcademicYear[];
}

export interface ExamDetailsResponse {
    examgradelist: ExamGrade[];
}
