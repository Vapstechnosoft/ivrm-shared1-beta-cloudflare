/**
 * Admin On Duty Apply Types
 * API: /api/AdminOnDutyApply/get_employee_on_duty_leave_apply
 */

/**
 * Frontend model for Admin On Duty Apply List
 */
export interface AdminOnDutyApply {
    id: number; // hrelaP_Id
    employeeName: string; // hrmE_EmployeeFirstName
    leaveName: string; // hrmL_LeaveName
    leaveCode: string; // hrmL_LeaveCode
    fromDate: Date; // hrelaP_FromDate
    toDate: Date; // hrelaP_ToDate
    totalDays: number; // hreltD_TotDays
    status: string; // hrelaP_ApplicationStatus
    leaveReason: string; // hrelaP_LeaveReason
    inTime: string; // hrelapD_InTime
    outTime: string; // hrelapD_OutTime
    leaveId: number; // hrmL_Id
    employeeId: number; // hrmE_Id
    isActive?: boolean; // hrelaP_ActiveFlg
}

/**
 * API Response structure for On Duty Apply List Item
 */
export interface AdminOnDutyApplyApiData {
    hrmE_EmployeeFirstName: string;
    hrelaP_Id: number;
    hrmL_LeaveName: string;
    hrmL_LeaveCode: string;
    hrelaP_FromDate: string;
    hrelaP_ToDate: string;
    hrelaP_ApplicationStatus: string;
    hrmL_Id: number;
    hreltD_TotDays: number;
    hrmE_Id: number;
    hrelaP_LeaveReason: string;
    hrelapD_InTime: string;
    hrelapD_OutTime: string;
    hrelaP_ActiveFlg?: boolean;
}

/**
 * API Response for Employee Details
 */
export interface EmployeeOnDutyDetailsResponse {
    leaveDetails: AdminOnDutyApplyApiData[];
    employeeDetails: EmployeeDetailsApiData;
}

export interface EmployeeDetailsApiData {
    hrmE_Id: number;
    employeeName: string;
    mobileNo: number;
    emailId: string;
    hrmE_DOJ: string;
    hrmdeS_DesignationName: string;
    hrmE_Photo: string;
    hrmeM_EmailId: string;
    hrmemnO_MobileNo: number;
    foesT_IHalfLoginTime: string;
    foesT_IIHalfLogoutTime: string;
}

/**
 * Frontend model for Employee Details
 */
export interface EmployeeDetails {
    id: number;
    name: string;
    designation: string;
    doj: Date;
    photo: string;
    email: string;
    mobile: string;
    loginTime: string;
    logoutTime: string;
}

/**
 * API Request for saving On Duty Leave
 */
export interface OnDutyLeaveSaveRequest {
    MI_Id?: number;
    UserId?: number;
    HRELAP_Id?: number;
    HRME_Id: number;
    HRML_LeaveType: string;
    HRELAP_FromDate: string;
    HRELAP_ToDate: string;
    HRELAP_TotalDays: number;
    HRELAP_LeaveReason: string;
    HRELAPD_InTime: string;
    HRELAPD_OutTime: string;
    HRELT_SupportingDocument?: string;
}
