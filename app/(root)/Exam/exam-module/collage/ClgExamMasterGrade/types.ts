export interface IClgMasterGrade {
    emgR_Id: number;
    emgR_GradeName: string;
    emgR_MarksPerFlag: 'P' | 'M' | string;
    emgR_ActiveFlag?: boolean | number;
}

export interface IClgGradeSubRow {
    count?: number;
    EMGD_From: string;
    EMGD_To: string;
    EMGD_Name: string;
    EMGD_GradePoints: string;
    EMGD_Remarks: string;
}

export interface IClgGradeDetailRecord {
    emgD_Id?: number;
    emgD_Name: string;
    emgD_From: number | string;
    emgD_To: number | string;
    emgD_GradePoints: number | string;
    emgD_Remarks: string;
}

export interface IClgExamMasterGradeApiResponse {
    grade_list?: IClgMasterGrade[];
    edit_m_grade?: Array<{
        emgR_Id: number;
        emgR_GradeName: string;
        emgR_MarksPerFlag: 'P' | 'M' | string;
        emgR_ActiveFlag?: boolean;
    }>;
    edit_m_grade_details?: Array<{
        emgD_Id?: number;
        emgD_From: number | string;
        emgD_To: number | string;
        emgD_Name: string;
        emgD_GradePoints: number | string;
        emgD_Remarks: string;
    }>;
    view_grade_details?: IClgGradeDetailRecord[];
    emgR_GradeName?: string;
    emgR_Id?: number;
    returnval?: boolean;
    returnduplicatestatus?: string;
    already_cnt?: boolean;
    message?: string;
}
