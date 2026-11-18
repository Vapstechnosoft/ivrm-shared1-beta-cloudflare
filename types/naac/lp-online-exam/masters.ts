export interface IMasterOEExamSection {
    lpmoeeXSEC_Id?: number;
    lpmoeeX_Id?: number;
    lpmoeeXSEC_SectionName: string;
    lpmoeeXSEC_SectionOrder: number;
    lpmoeeXSEC_MaxQns?: number;
    lpmoeeXSEC_TotalQns?: number;
    lpmoeeXSEC_Marks?: number;
}

export interface IMasterOEExamSectionOption {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface IMasterOEExamMasterExamOption {
    emE_Id: number;
    emE_ExamName: string;
}

export interface IMasterOEExam {
    lpmoeeX_Id: number;
    LPMOEEX_Id?: number;
    asmaY_Id: number;
    ASMAY_Id?: number;
    asmaY_Year?: string;
    asmcL_Id: number;
    ASMCL_Id?: number;
    asmcL_ClassName?: string;
    asmS_Id?: number;
    ASMS_Id?: number;
    asmC_SectionName?: string;
    ismS_Id: number;
    ISMS_Id?: number;
    ismS_SubjectName?: string;
    emE_Id?: number;
    EME_Id?: number;
    emE_ExamName?: string;
    lpmoeeX_ExamName: string;
    LPMOEEX_ExamName?: string;
    lpmoeeX_TotalMarks: number;
    LPMOEEX_TotalMarks?: number;
    lpmoeeX_NoOfQuestion: number;
    LPMOEEX_NoOfQuestion?: number;
    lpmoeeX_TotalDuration?: number;
    LPMOEEX_TotalDuration?: number;
    lpmoeeX_ExamStartDate?: string;
    LPMOEEX_ExamStartDate?: string;
    lpmoeeX_ExamStartTime?: string;
    LPMOEEX_ExamStartTime?: string;
    lpmoeeX_ExamEndDate?: string;
    LPMOEEX_ExamEndDate?: string;
    lpmoeeX_ExamEndTime?: string;
    LPMOEEX_ExamEndTime?: string;
    lpmoeeX_RandomQnsFlg?: boolean;
    LPMOEEX_RandomQnsFlg?: boolean;
    lpmoeeX_AutoPublishFlg?: boolean;
    LPMOEEX_AutoPublishFlg?: boolean;
    lpmoeeX_UploadQnsFlg?: boolean;
    LPMOEEX_UploadQnsFlg?: boolean;
    lpmoeeX_AllowDownloadFlg?: boolean;
    LPMOEEX_AllowDownloadFlg?: boolean;
    lpmoeeX_DurationFlg?: string;
    LPMOEEX_DurationFlg?: string;
    lpmoeeX_Duration?: number;
    LPMOEEX_Duration?: number;
    creationType?: 'manual' | 'question_bank';
    section_list?: IMasterOEExamSection[];
    lpmoeeX_ActiveFlg: boolean;
    lpmoeeX_CreatedDate?: string;
    lpmoeeX_UpdatedDate?: string;
}

export interface IMasterOEExamYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IMasterOEExamClass {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface IMasterOEExamSubject {
    ismS_Id: number;
    ismS_SubjectName: string;
}

export interface IMasterOEExamInitialData {
    getyear: IMasterOEExamYear[];
    getclass: IMasterOEExamClass[];
    getsections?: IMasterOEExamSectionOption[];
    getsubjects: IMasterOEExamSubject[];
    getexams?: IMasterOEExamMasterExamOption[];
}

