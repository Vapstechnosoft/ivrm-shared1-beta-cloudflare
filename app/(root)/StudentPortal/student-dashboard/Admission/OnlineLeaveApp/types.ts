export interface OnlineLeaveApp_DTO {
    aslA_Id?: number;
    asmS_Id?: number;
    aslA_Flag?: string;
    aslA_ApplyDate?: string;
    aslA_FromDate?: string;
    aslA_ToDate?: string;
    aslA_Reason?: string;
    aslA_Status?: string;
    aslA_LeaveId?: number;
    trans_id?: number;
    returnval?: boolean;
    studentdetails?: StudentDetails[];
    student_s_list?: StudentDetails[]; // API variation
    leave_name?: string;
    user_id?: number;
    roleId?: number;
    allstuddata?: LeaveApplication[];
    student_leave_list?: LeaveApplication[]; // API variation
    yearlist?: any[];
    studentdivlist?: any[];
    section_s_list?: any[];
    class_s_list?: any[];
    student_id_list?: any[];
    editlist?: any[];
    pendingleave?: LeaveApplication[];
    roletype?: string;
}

export interface StudentDetails {
    asmS_Id: number;
    asmcL_Id: number;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_RegistrationNo: string;
    amsT_MobileNo: number;
    amsT_emailId: string;
}

export interface LeaveApplication {
    aslA_Id: number;
    asmS_Id: number;
    aslA_Flag: string; // 'OnStudy' | 'Leave'
    aslA_ApplyDate: string;
    aslA_FromDate: string;
    aslA_ToDate: string;
    aslA_Reason: string;
    aslA_Status: string;
    aslA_ActiveFlag: boolean;
    aslA_LeaveId?: number;
    amsT_FirstName?: string;
    asmcL_ClassName?: string;
    asmC_SectionName?: string;
    aslA_LeaveName?: string;
    aslaP_Id?: number;
    aslaP_AppRejDate?: string;
    aslaP_AppFromDate?: string;
    aslaP_AppToDate?: string;
    aslaP_LeaveStatus?: string;
    asalP_RejectReason?: string;
}

export interface LeaveLoadData {
    roletype: string;
    studentdetails: StudentDetails[];
    allstuddata: LeaveApplication[];
    pendingleave?: LeaveApplication[];
    yearlist?: any[];
    mi_Id?: number;
    asmaY_Id?: number;
}

export interface LeaveApplyPayload {
    aslA_Id: number;
    mi_Id: number;
    amsT_Id: number;
    asmaY_Id: number;
    aslA_LeaveId?: number;
    aslA_Reason: string;
    aslA_ApplyDate: string;
    aslA_FromDate: string;
    aslA_ToDate: string;
    aslA_Flag: string;
}
