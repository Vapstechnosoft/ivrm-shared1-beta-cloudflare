export interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IAdmissionStatusItem {
    PAMS_Id?: number;
    PAMST_Status: string;
    Data_count: number;
}

export interface IApplicationStatusItem {
    PASRAPS_ID: number | string;
    data: number;
    statusName?: string;
}

export interface ICountStatusInitialData {
    academicList?: IAcademicYear[];
    yearlist?: IAcademicYear[];
    yearList?: IAcademicYear[];
}

export interface ICountStatusReportData {
    countreportstatus?: IAdmissionStatusItem[];
    applicationstatus?: IApplicationStatusItem[];
}
