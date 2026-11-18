/**
 * Leave Authorization API Types
 * Types for the Leave Authorization Management API endpoints
 */

/**
 * Request payload for GetAuthLeave endpoint
 * POST /api/LeaveAuthorizationFacade/GetAuthLeave
 */
export interface LeaveAuthorizationGetRequest {
    UserId: number;
    MI_Id: number;
    onchangeoronload: string;
}

/**
 * Response data structure from GetAuthLeave endpoint
 */
export interface LeaveAuthorizationGetResponseData {
    // Add fields based on API response structure
    // These will be updated once we see the actual API response
    [key: string]: any;
}

/**
 * Full API response structure
 */
export interface LeaveAuthorizationGetResponse {
    success: boolean;
    message: string;
    data: LeaveAuthorizationGetResponseData;
    total: number | null;
    page: number | null;
    page_size: number | null;
}

/**
 * Approval user item in approvaluser_array
 */
export interface ApprovalUserItem {
    approval_HRME_Id: number;
    approvalLevelNo: number;
    approvalFinalFlag: boolean;
}

/**
 * Request payload for Save/Update Leave Authorization endpoint
 * POST /api/LeaveAuthorizationFacade/SaveAuthData
 */
export interface LeaveAuthorizationSaveRequest {
    hrla_Id?: number;
    hrmG_Id: number;
    hrmgT_Id: number;
    hrmD_Id: number;
    hrmdeS_Id: number;
    hrmL_Id: number;
    userId: number;
    approvalUser: ApprovalUserItem[];
    // Keeping MI_Id optional as it might be needed for other purposes or legacy checks,
    // but the target payload doesn't strictly show it. Current server implementation ignores it for the body.
    MI_Id?: number;
}

/**
 * Response from Save/Update Leave Authorization endpoint
 */
export interface LeaveAuthorizationSaveResponse {
    success: boolean;
    message: string;
    data: LeaveAuthorizationGetResponseData | null;
    retrunMsg?: string;
    returnval?: boolean;
    returnval_add?: boolean;
    returnval_Update?: boolean;
}

/**
 * Request payload for EditDetails endpoint
 * POST /api/LeaveAuthorizationFacade/EditDetails
 */
export interface LeaveAuthorizationEditRequest {
    HRLAON_Id: number;
}

/**
 * Response from EditDetails endpoint
 */
export interface LeaveAuthorizationEditResponse {
    success: boolean;
    message: string;
    data: LeaveAuthorizationGetResponseData | null;
}

/**
 * Request payload for DeleteAuth endpoint
 * POST /api/LeaveAuthorizationFacade/DeleteAuth
 */
export interface LeaveAuthorizationDeleteRequest {
    HRLA_Id: number;
    HRLAON_Id: number;
}

/**
 * Response from DeleteAuth endpoint
 */
export interface LeaveAuthorizationDeleteResponse {
    success: boolean;
    message: string;
    data: any;
}
