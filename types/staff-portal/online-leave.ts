export interface IOnlineLeaveEmployee {
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

export interface ILeaveBalance {
    hrelS_Id: number;
    hrmL_LeaveName: string;
    hrmL_LeaveCode: string;
    hrelS_TotalLeaves: number;
    hrelS_CreditedLeaves: number;
    hrelS_TransLeaves: number;
    hrelS_CBLeaves: number;
    hrmL_Id: number;
    hrmE_Id: number;
    hrmL_WhenToApplyFlg: string | null;
    hrmL_NoOfDays: number | null;
    // UI specific fields for form management
    fromDate?: Date;
    toDate?: Date;
    hrelaP_TotalDays?: number;
    isHalfDay?: boolean;
}

export interface ILeaveHistory {
    hrelaP_Id: number;
    hrmL_LeaveName: string;
    hrelaP_FromDate: string;
    hrelaP_ToDate: string;
    hreltD_TotDays: number;
    hrelaP_TotalDays: number;
    hrelaP_ApplicationStatus: string;
    hrmL_Id: number;
    hrelaP_LeaveReason: string;
    hrelapA_Remarks: string | null;
    hrelaP_SupportingDocument: string;
}

export interface ILeaveApplicationGrid {
    hrmE_EmployeeFirstName: string;
    hrmL_LeaveName: string;
    hrmL_LeaveType: string;
    hrelaP_ApplicationDate: string;
    hrelaP_FromDate: string;
    hrelaP_ToDate: string;
    hrelaP_TotalDays: number;
    hrelaP_LeaveReason: string;
    hrelaP_ApplicationStatus: string;
    hrelapD_InTime: string | null;
    hrelapD_OutTime: string | null;
}

export interface IOnlineLeaveInitialResponse {
    employeeLeaveDetails: ILeaveBalance[];
    employeeDetails: IOnlineLeaveEmployee[];
    leaveCount: { hrmL_LeaveName: string; clCount: number }[];
}

export interface IOnlineLeaveHistoryResponse {
    employeeLeaveDetails: ILeaveHistory[]; // This seems to be the history list
    leaveApplicationGridDetails: ILeaveApplicationGrid[];
}

export interface ILeaveApplicationRequest {
    hrmE_Id: number;
    hrelaP_Id: number;
    asmay_id: number;
    hrelaP_ApplicationID: string | null;
    hrelaP_LeaveReason: string;
    hrelT_LeaveReason: string;
    hrelT_Reportingdate: string;
    hrelT_SupportingDocument: string;
    hrmE_MobileNo: number;
    frmToDates: {
        hrelaP_FromDate: string;
        hrelaP_ToDate: string;
        hrelaP_TotalDays: number;
    }[];
    temp_table_data: {
        hrmL_Id: number;
        hrmL_LeaveName: string;
        hrelS_Id: number;
        hrelS_CBLeaves: number;
    }[];
}
