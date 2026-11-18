export interface AcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    selected?: boolean;
}

export interface ClassDetails {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface SectionDetails {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface Subject {
    ismS_Id: number;
    ismS_SubjectName: string;
    selected?: boolean;
}

export interface ExamGrade {
    emE_Id: number;
    emE_ExamName: string;
    estmpS_MaxMarks: number;
    estmpS_ObtainedMarks: number;
    estmpS_ObtainedGrade: string;
    estmpS_PassFailFlg?: string;
}

export interface CumulativeSubjectLoadData {
    stuyearlist: (AcademicYear & ClassDetails & SectionDetails)[];
}

export interface CumulativeSubjectDataRequest {
    asmaY_Id: number;
    ismS_Id?: number;
}

export interface SubjectListResponse {
    subjectlist: Subject[];
    stuyearlist: (AcademicYear & ClassDetails & SectionDetails)[];
}

export interface ExamDetailsResponse {
    examgradelist: ExamGrade[];
}

// Zod Schema for Form Validation
import { z } from 'zod';

export const cumulativeSubjectSchema = z.object({
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    ismS_Id: z.number().min(1, 'Subject is required')
});

export type CumulativeSubjectFormData = z.infer<typeof cumulativeSubjectSchema>;
