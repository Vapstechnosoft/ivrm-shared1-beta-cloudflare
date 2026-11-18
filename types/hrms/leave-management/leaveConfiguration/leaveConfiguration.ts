/**
 * Leave Configuration Types
 * Matching IVRM LeaveConfiguration (HR_Leave_Policy_Config_DTO)
 */

/**
 * Raw Leave Configuration Data Structure (API Response / DTO)
 */
export interface LeaveConfigurationData {
    hrlpC_Id?: number;
    HRLPC_Id?: number;
    mI_Id?: number;
    MI_Id?: number;
    hrlpC_LeavePolicyName?: string;
    HRLPC_LeavePolicyName?: string;
    hrlpC_SPName?: string;
    HRLPC_SPName?: string;
    hrlpC_ServiceName?: string;
    HRLPC_ServiceName?: string;
    hrlpC_LateInFlag?: boolean | string;
    HRLPC_LateInFlag?: boolean | string;
    hrlpC_LateInTime?: string;
    HRLPC_LateInTime?: string;
    hrlpC_EarlyOutFlag?: boolean | string;
    HRLPC_EarlyOutFlag?: boolean | string;
    hrlpC_EarlyOutTime?: string;
    HRLPC_EarlyOutTime?: string;
    hrlpC_CummulativeTimeFlag?: boolean | string;
    HRLPC_CummulativeTimeFlag?: boolean | string;
    hrlpC_CummulativeTime?: string | number;
    HRLPC_CummulativeTime?: string | number;
    hrlpC_AfterCummulativeTime?: string;
    HRLPC_AfterCummulativeTime?: string;
    hrlpC_NoOfLates?: number | string;
    HRLPC_NoOfLates?: number | string;
    hrlpC_NoOfLatesFag?: boolean | string;
    HRLPC_NoOfLatesFag?: boolean | string;
    hrlpC_NoOfLatesFlag?: boolean | string;
    HRLPC_NoOfLatesFlag?: boolean | string;
    hrlpC_NoOfLatesCFFlag?: boolean | string;
    HRLPC_NoOfLatesCFFlag?: boolean | string;
    hrlpC_LeavePrefixSuffixFlag?: boolean | string;
    HRLPC_LeavePrefixSuffixFlag?: boolean | string;
    hrlpC_IncludeHolidayFlag?: boolean | string;
    HRLPC_IncludeHolidayFlag?: boolean | string;
    hrlpC_LateLOPFlag?: boolean | string;
    HRLPC_LateLOPFlag?: boolean | string;
    hrlpC_LateLeaveFlag?: boolean | string;
    HRLPC_LateLeaveFlag?: boolean | string;
    hrlpC_SpOrGen?: string;
    HRLPC_SpOrGen?: string;
    hrlpC_AbsentLOPFlag?: boolean | string;
    HRLPC_AbsentLOPFlag?: boolean | string;
    hrlpC_AbsentLeaveFlag?: boolean | string;
    HRLPC_AbsentLeaveFlag?: boolean | string;
    config_data?: any[];
    returnval?: boolean;
    [key: string]: any;
}

/**
 * API Response for GET Leave Configuration (getSPName)
 */
export interface LeaveConfigurationGetResponse {
    success?: boolean;
    message?: string;
    config_data?: any[];
    data?: LeaveConfigurationData | any[] | null;
    returnval?: boolean;
    HRLPC_Id?: number;
    [key: string]: any;
}

/**
 * API Request for Save Leave Configuration (SaveData)
 */
export interface LeaveConfigurationSaveRequest {
    HRLPC_Id?: number;
    MI_Id?: number;
    HRLPC_LeavePolicyName: string;
    HRLPC_SPName: string;
    HRLPC_ServiceName: string;
    HRLPC_LateInFlag: boolean | string;
    HRLPC_LateInTime: string;
    HRLPC_EarlyOutFlag: boolean | string;
    HRLPC_EarlyOutTime: string;
    HRLPC_CummulativeTimeFlag: boolean | string;
    HRLPC_CummulativeTime: string;
    HRLPC_AfterCummulativeTime: string;
    HRLPC_NoOfLatesCFFlag: boolean | string;
    HRLPC_LeavePrefixSuffixFlag: boolean | string;
    HRLPC_IncludeHolidayFlag: boolean | string;
    HRLPC_LateLeaveFlag: boolean;
    HRLPC_LateLOPFlag: boolean;
    HRLPC_NoOfLatesFag: boolean | string;
    HRLPC_NoOfLates: number;
    HRLPC_SpOrGen: string;
    HRLPC_AbsentLOPFlag: boolean;
    HRLPC_AbsentLeaveFlag: boolean;
    LoginId?: number;
    [key: string]: any;
}

/**
 * Frontend Form Data Structure matching IVRM LeaveConfiguration.html
 */
export interface LeaveConfigurationFormData {
    id?: number;
    policy_name: string;
    proc_name?: string;
    servic_name: string;
    late_flag: boolean;
    Late_Time: string;
    numlate_flag: boolean;
    Late_num: string;
    Early: boolean;
    Early_Time: string;
    Time_flag: boolean;
    cum_time: string;
    Aftr_cum_time: string;
    carry_flag: boolean;
    sufix_flag: boolean;
    holiday_inc_flag: boolean;
    HRLPC_LateLeaveFlag: 'leave' | 'lop';
    sporgen_flag: 'SP' | 'GEN';
    HRLPC_AbsentLeaveFlag: 'leave' | 'lop';
}
