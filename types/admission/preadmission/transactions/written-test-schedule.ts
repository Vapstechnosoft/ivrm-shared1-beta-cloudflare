export interface IWrittenTestSchedule {
    pawtS_Id: number;
    pawtS_ScheduleName: string;
    pawtS_ScheduleDate: string;
    pawtS_ScheduleTime: string;
    pawtS_ScheduleTimeTo: string;
    pawtS_AM_PM?: string;
    pawtS_Remarks?: string;
    pawtS_Superviser?: string;
    pawtS_Skills?: string;
    pawtS_TPFlag?: boolean;
    pawtS_TimePeriod?: number;
    pawtS_Strength?: number;
    count?: number;
    delete?: boolean;
    fromtime?: string;
    totime?: string;
    childarray?: any[];
    createdDate?: string;
}

export interface IStudentDetails {
    pasR_Id: number;
    pasR_FirstName: string;
    pasR_MiddleName?: string;
    pasR_LastName?: string;
    pasR_RegistrationNo: string;
    pasR_Sex: string;
    pasR_MobileNo?: number;
    pasR_emailId?: string;
    asmcL_Id: number;
    mI_Id?: number;
    classname?: string;
    name?: string;
    checked?: boolean;
    makedisable?: boolean;
    ScheduleDate?: string;
    ScheduleTime?: string;
    ScheduleTimeTo?: string;
    scheduledate?: string;
    scheduletime?: string;
    scheduletimeto?: string;
    regno?: string;
    pasr_id?: number;
    count?: number;
    pawts_id?: number;
}

export interface IWrittenTestScheduleDetails {
    admissioncatdrpall?: Array<{
        asmcL_Id: number;
        asmcL_ClassName: string;
    }>;
    writtenTestSchedule: IWrittenTestSchedule[];
    studentDetails?: IStudentDetails[];
    selectedStudentDetails?: IStudentDetails[];
    schedulecount: Array<{
        pawtS_Id: number;
        count: number;
    }>;
    allname5?: Array<{
        pasr_id: number;
        studentname: string;
        registrationNo: string;
        classid: number;
        gender: string;
        email: string;
        mobileNumber: string;
    }>;
}
