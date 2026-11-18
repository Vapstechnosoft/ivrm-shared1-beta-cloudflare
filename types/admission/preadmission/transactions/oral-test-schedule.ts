export interface IOralTestSchedule {
    paotS_Id: number;
    paotS_ScheduleName: string;
    paotS_ScheduleDate: string;
    paotS_ScheduleTime: string;
    paotS_ScheduleTimeTo: string;
    paotS_AM_PM: string;
    paotS_Remarks: string;
    paotS_Superviser: string;
    paotS_Skills: string;
    paotS_TPFlag: boolean;
    paotS_TimePeriod: number;
    paotS_Strength: number;
    ocount?: number;
    vc?: boolean;
    delete?: boolean;
    fromtime?: string;
    totime?: string;
    childarray?: any[];
    createdDate?: string;
}

export interface IStudentDetails {
    pasR_Id: number;
    pasR_FirstName: string;
    pasR_MiddleName: string;
    pasR_LastName: string;
    pasR_RegistrationNo: string;
    pasR_Sex: string;
    pasR_MobileNo: number;
    pasR_emailId: string;
    asmcL_Id: number;
    mI_Id?: number;
    classname?: string;
    name?: string;
    checked?: boolean;
    makedisable?: boolean;
    vcmeeting?: boolean;
    ScheduleDate?: string;
    ScheduleTime?: string;
    ScheduleTimeTo?: string;
    scheduledate?: string;
    scheduletime?: string;
    scheduletimeto?: string;
    regno?: string;
    pasr_id?: number;
}

export interface IStaffDetails {
    hrmE_Id: number;
    hrmE_EmployeeFirstName: string;
    hrmE_EmployeeMiddleName: string;
    hrmE_EmployeeLastName: string;
    userid: number;
    select?: boolean;
}

export interface IOralTestScheduleDetails {
    classlist: Array<{
        asmcL_Id: number;
        asmcL_ClassName: string;
    }>;
    oralTestSchedule: IOralTestSchedule[];
    stafflist: IStaffDetails[];
    oralTestSchedulecount: any[];
    overallOralTestSchedulecount: any[];
    vcOralTestSchedule: any[];
}
