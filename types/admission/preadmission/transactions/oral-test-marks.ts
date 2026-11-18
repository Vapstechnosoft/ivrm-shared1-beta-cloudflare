export interface IOralTestMarksSchedule {
    paotS_Id: number;
    paotS_ScheduleName: string;
    selected?: boolean;
}

export interface IOralTestMarksStudent {
    pasR_Id: number;
    pasR_FirstName: string;
    pasR_MiddleName?: string;
    pasR_LastName?: string;
    name?: string;
    checked?: boolean;
}

export interface IOralTestMarksInitialData {
    oralTestSchedule: IOralTestMarksSchedule[];
    studentDetails?: IOralTestMarksStudent[];
    chq_config: boolean;
}

export interface IOralTestMarksGridData {
    pasR_Id: number;
    pasR_FirstName: string;
    pasR_MiddleName?: string;
    pasR_LastName?: string;
    oralTestByPerson: string;
    oral_MaxMarks: number;
    obtMarks?: number;
    flagsubject: string;
}

export interface IOralTestMarksSavePayload {
    PAOTM_OralBy: string | number;
    SelectedStudentMarksData: IOralTestMarksGridData[];
    OralTestScheduleAppFlag: boolean;
    PAOTS_Id: number;
}
