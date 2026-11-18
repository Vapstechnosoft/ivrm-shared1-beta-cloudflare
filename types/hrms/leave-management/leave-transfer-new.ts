export interface LeaveCreditBalanceGridItem {
    hrmE_Id: number;
    hrmL_LeaveName: string;
    hrmlY_LeaveYear: string;
    hrmE_EmployeeName: string | null;
    hrelS_CBLeaves: number;
    hrelS_TotalLeaves: number;
    hrmL_Id: number;
    hrmlY_Id: number;
    hrelS_Id: number;
}

export interface GetLeaveCreditAndBalanceGridResponse {
    success: boolean;
    message: string;
    data: LeaveCreditBalanceGridItem[];
    total: number;
    page: number;
    page_size: number;
}

export interface UpdateLeaveStatusTabPayload {
    HRME_SubstituteFlag: string;
    HRELAP_Id: number;
    HRML_Id: number;
    HRMLY_Id: number;
    monthid: number;
    emplist: {
        HRME_Id: number;
        HRELS_CreditedLeaves: number;
    }[];
}

export interface LeaveAdditionStatusTabPayload {
    HRML_Id: number;
    HRMLY_Id: number;
    employees: {
        HRME_Id: number;
        HRELS_CreditedLeaves: number;
    }[];
}

export interface LeaveCarryForwardStatusTabPayload {
    employees: {
        hrmE_Id: number;
        hrelS_CreditedLeaves: number;
    }[];
}

export interface DeleteLeaveStatusByIdRequest {
    hrels_id: number;
}
