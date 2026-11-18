export interface OnlineAdminLeaveApplication {
    hrelaP_Id: number;
    hrmL_LeaveName: string;
    hrelaP_FromDate: string;
    hrelaP_ToDate: string;
    hreltD_TotDays: number;
    hrelaP_ApplicationStatus: string;
    hrmL_Id: number;
    hrelaP_LeaveReason: string;
    hrelapA_Remarks: string | null;
    hrelaP_SupportingDocument: string;
}

export interface OnlineAdminLeaveBalance {
    hrelS_Id: number;
    hrmL_LeaveName: string;
    hrelS_TotalLeaves: number;
    hrelS_CreditedLeaves: number;
    hrelS_TransLeaves: number;
    hrelS_CBLeaves: number;
    hrmL_Id: number;
    hrmemnO_MobileNo: number;
}

export interface EmployeeDetails {
    hrmE_Id: number;
    hrmE_EmployeeName: string;
    hrmE_DOJ: string;
    hrmE_MobileNo: number;
    hrmE_EmailId: string;
    hrmdeS_DesignationName: string;
    hrmE_EmployeeCode: string;
    hrelapD_OutTime: string;
    hrelapD_InTime: string;
}

export interface EmployeeLeaveResponse {
    employeeLeaves: OnlineAdminLeaveBalance[];
    employeeDetails: EmployeeDetails;
    get_leave_details?: OnlineAdminLeaveApplication[];
}

export interface EmployeeDropDown {
    hrmE_Id: number;
    employeeName: string;
    hrmE_EmployeeCode: string;
}

export interface FromToDate {
    HRELAP_FromDate: string;
    HRELAP_ToDate: string;
    HRELAP_TotalDays: number;
}

export interface TempTableData {
    HRML_Id: number;
}

export interface SaveAdminEmployeeLeaveApplicationRequest {
    HRME_Id: number;
    HRELT_Reportingdate: string;
    HRELT_LeaveReason: string;
    HRELT_SupportingDocument: string;
    HRELT_ContactNoOnLeave?: string | number;
    frmToDates: FromToDate[];
    temp_table_data: TempTableData[];
}
