export interface AppointmentApprovalDTO {
    VMAP_Id: number;
    VMAP_VisitorName: string;
    VMAP_VisitorContactNo: string;
    VMAP_VisitorEmailid: string;
    VMAP_FromAddress: string;
    VMAP_ToMeet: string; // Employee Name
    hrmE_Id: number;
    hrmE_EmployeeFirstName?: string;
    VMAP_MeetingDateTime: string;
    VMAP_MeetingTiming: string; // From Time
    VMAP_MeetingToTime: string; // To Time
    VMAP_MeetingTiming1?: string; // Formatted From Time
    VMAP_MeetingToTime1?: string; // Formatted To Time
    VMAP_MeetingPurpose: string;
    VMAP_FromPlace: string;
    VMAP_Status: string;
    VMAP_Remarks: string;
    VMAP_MeetingLocation: string;
    VMAP_EntryDateTime: string;
    LoginDate?: string;
    LoginTime1?: string;
    createdby?: string;
    FCNT?: number; // Document count
    vmapvI_VisitorName?: string;
    vmapvI_VisitorContactNo?: string;
    vmapvI_VisitorEmailId?: string;
    vmapvI_VisitorAddress?: string;
}

export interface VisitorListDTO {
    vmaP_Id: number;
    vmaP_VisitorName: string;
    vmaP_VisitorContactNo: string;
    vmaP_VisitorEmailid: string;
    vmaP_FromAddress: string;
}

export interface EmployeeDTO {
    hrmE_Id: number;
    hrmE_EmployeeFirstName: string;
}

export interface AppointmentApprovalLoadData {
    visitorlist: AppointmentApprovalDTO[];
    griddata: AppointmentApprovalDTO[];
    emplist: EmployeeDTO[];
}

// export interface SaveAppointmentApprovalResponse extends ApiResponse {
//     returnVal: string;
// }
