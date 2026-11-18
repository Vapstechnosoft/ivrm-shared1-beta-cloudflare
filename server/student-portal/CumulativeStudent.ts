// Type definitions for Cumulative Subject module

export interface StudentYear {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_From_Date?: string;
    asmaY_To_Date?: string;
    asmaY_Order?: number;
    asmcL_ClassName: string;
    asmC_SectionName: string;
}

// Alias for backward compatibility
export type AcademicYear = StudentYear;

export interface CumulativeSubjectLoadData {
    stuyearlist: StudentYear[];
}

export interface Subject {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode?: string;
    ismS_OrderFlag?: number;
}

export interface SubjectListResponse {
    subjectlist: Subject[];
    stuyearlist: StudentYear[];
}

export interface ExamGrade {
    emE_Id: number;
    emE_ExamName: string;
    emE_ExamCode?: string;
    emE_ExamOrder?: number;
    estmpS_MaxMarks: number;
    estmpS_ObtainedMarks: number;
    estmpS_ObtainedGrade: string;
    estmpS_Percentage?: number;
}

export interface ExamDetailsResponse {
    examgradelist: ExamGrade[];
}
