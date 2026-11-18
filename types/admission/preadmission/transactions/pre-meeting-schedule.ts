export interface IPreMeetingSchedule {
    lmslmeeT_Id: number;
    hrmE_Id: number;
    studentname: string;
    pasr_id: number;
    lmslmeeT_MeetingTopic: string;
    lmslmeeT_MeetingDate: string | null;
    lmslmeeT_PlannedStartTime: string;
    lmslmeeT_PlannedEndTime: string;
    started: boolean | number;
    startanybody?: boolean | number;
    studentremarks: string;
    studentgrade: string;
    asmcL_ClassName?: string;
    asmC_SectionName?: string;
    ismS_IVRSSubjectName?: string;
}

export interface IEmployeeDropdown {
    hrmE_Id: number;
    emple?: boolean;
}

export interface IDepartmentDropdown {
    hrmD_Id: number;
    selected?: boolean;
}

export interface IDesignationDropdown {
    hrmdeS_Id: number;
    selected?: boolean;
}

export interface IGroupTypeDropdown {
    hrmgT_Id: number;
    selected?: boolean;
}

export interface IEmployeeTypeDropdown {
    hrmeT_Id: number;
    selected?: boolean;
}
