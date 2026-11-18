export interface ISubjectItem {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode?: string;
    ismS_OrderFlag?: number;
    checkedvalue?: boolean;
    subject?: boolean;
    [key: string]: any;
}

export interface ISubjectGroupRecord {
    emG_Id: number;
    emGS_Id?: number;
    emG_GroupName: string;
    emG_TotSubjects: number;
    emG_MaxAplSubjects: number;
    emG_MinAplSubjects: number;
    emG_BestOff: number;
    emG_ElectiveFlg: number | boolean;
    emG_ActiveFlag?: boolean;
    [key: string]: any;
}

export interface IViewGroupSubject {
    emgS_Id?: number;
    emG_GroupName?: string;
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode?: string;
    [key: string]: any;
}

export interface IGetDetailsResponse {
    subjectlist?: ISubjectItem[];
    group_list?: ISubjectGroupRecord[];
    [key: string]: any;
}

export interface IGetGroupDetailsResponse {
    edit_m_group?: ISubjectGroupRecord[];
    edit_m_group_subjects?: { ismS_Id: number; [key: string]: any }[];
    [key: string]: any;
}

export interface IViewRecordsResponse {
    view_group_subjects?: IViewGroupSubject[];
    [key: string]: any;
}

export interface ISaveGroupPayload {
    EMG_Id?: number;
    EMGS_Id?: number;
    EMG_GroupName: string;
    EMG_TotSubjects: number;
    EMG_MaxAplSubjects: number;
    EMG_MinAplSubjects: number;
    EMG_BestOff: number;
    EMG_ElectiveFlg: number;
    subj_list: ISubjectItem[];
}

export interface ISaveGroupResponse {
    emG_Id?: number;
    returnval?: boolean;
    returnduplicatestatus?: string;
    group_list?: ISubjectGroupRecord[];
    message?: string;
    [key: string]: any;
}

export interface IDeactivateResponse {
    already_cnt?: boolean;
    returnval?: boolean;
    message?: string;
    [key: string]: any;
}
