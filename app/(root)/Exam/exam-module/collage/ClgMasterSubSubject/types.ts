export interface IClgMasterSubSubject {
    emsS_Id: number;
    emsS_SubSubjectName: string;
    emsS_SubSubjectCode: string;
    emsS_Order: number;
    emsS_ActiveFlag?: boolean | number;
}

export interface IClgSubSubjectOrder {
    id: number;
    emsS_Id: number;
    emsS_SubSubjectName: string;
    emsS_SubSubjectCode: string;
    emsS_Order: number;
    emsS_ActiveFlag?: boolean | number;
}

export interface ClgMasterSubSubjectFormData {
    emsS_Id: number;
    emsS_SubSubjectName: string;
    emsS_SubSubjectCode: string;
}

export interface IClgMasterSubSubjectApiResponse {
    getlist?: IClgMasterSubSubject[];
    editlist?: IClgMasterSubSubject[];
    mastersubsubject?: IClgMasterSubSubject[];
    returnval?: boolean;
    returnduplicatestatus?: string;
    retrunMsg?: string;
    already_cnt?: boolean;
    emsS_Id?: number;
    message?: string;
}
