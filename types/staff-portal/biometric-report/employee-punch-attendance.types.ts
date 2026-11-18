export interface IEmployeeDetails {
    empFname: string;
    empMname: string;
    empLname: string;
    hrmE_DOJ: string;
    hrmD_DepartmentName: string;
    hrmdeS_DesignationName: string;
}

export type IEmployeePunchAttendanceReportData = IPunchDetail[] | undefined;

export interface IPunchDetail {
    ecode: string;
    ename: string;
    HRME_Id: number;
    punchdate: string;
    punchINtime: string;
    punchOUTtime: string;
    lateby: string;
    earlyby: string;
}

export interface IEmployeePunchAttendanceFilter {
    fromdate: string;
    todate: string;
}
