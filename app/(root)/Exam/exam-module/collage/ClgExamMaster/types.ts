export interface IClgMasterExam {
    emE_Id: number;
    emE_ExamName: string;
    emE_IVRSExamName: string;
    emE_ExamCode: string;
    emE_ExamDescription?: string;
    emE_ExamOrder: number;
    emE_FinalExamFlag: boolean | number;
    emE_ActiveFlag?: boolean | number;
}

export interface IClgExamOrder {
    id: number;
    emE_Id: number;
    emE_ExamName: string;
    emE_ExamCode: string;
    emE_ExamOrder: number;
    emE_FinalExamFlag?: boolean | number;
    emE_ActiveFlag?: boolean | number;
}

export interface ClgExamMasterFormData {
    emE_Id: number;
    emE_ExamName: string;
    emE_IVRSExamName: string;
    emE_ExamCode: string;
    emE_ExamDescription: string;
    emE_FinalExamFlag: boolean;
}

export interface IClgExamMasterApiResponse {
    exammastername?: IClgMasterExam[];
    editlist?: IClgMasterExam[];
    returnval?: boolean;
    returnduplicatestatus?: string;
    retrunMsg?: string;
    already_cnt?: boolean;
    emE_Id?: number;
    message?: string;
}
