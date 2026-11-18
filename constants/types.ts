export interface AcademicYear {
    asmaY_Id: number;
    mI_Id: number;
    asmaY_Year: string;
    asmaY_From_Date: string;
    asmaY_To_Date: string;
    asmaY_PreAdm_F_Date: string;
    asmaY_PreAdm_T_Date: string;
    asmaY_Order: number;
    asmaY_ActiveFlag: number;
    asmaY_Cut_Of_Date: string;
    asmaY_Pre_ActiveFlag: number;
    is_Active: boolean;
    asmaY_ReggularFlg: boolean;
    asmaY_NewFlg: boolean;
    asmaY_NewAdmissionFlg: boolean;
    asmaY_TransportSDate: string | null;
    asmaY_TransportEDate: string | null;
    asmaY_CreatedBy: number;
    asmaY_UpdatedBy: number;
    asmaY_ReferenceDate: string | null;
    asmaY_AcademicYearCode: string;
    asmaY_AdvanceFeeDate: string | null;
    asmaY_RegularFeeFDate: string;
    asmaY_RegularFeeTDate: string;
    asmaY_ArrearFeeDate: string | null;
    createdDate: string;
    updatedDate: string;
}

export interface StudentComplaint {
    ASCOMP_Id: number;
    AMST_FirstName: string;
    AMST_AdmNo: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    ASCOMP_Subject: string;
    ASCOMP_Complaints: string;
    ASCOMP_Date: string;
    ASCOMP_FilePath?: string;
    ASCOMP_FileName?: string;
    filetype?: string;
    document_Pathnew?: string;
}

export interface ComplaintData {
    aslA_Id: number;
    aslA_Reason: string | null;
    aslA_LeaveId: number;
    aslA_ApplyDate: string;
    aslA_FromDate: string;
    aslA_ToDate: string;
    aslA_Status: string | null;
    aslA_Flag: string | null;
    mI_Id: number;
    amsT_Id: number;
    asmaY_Id: number;
    aslA_ApprovedFromDate: string | null;
    aslA_ApprovedToDate: string | null;
    aslA_ActiveFlag: boolean;
    student_s_list: StudentComplaint[] | null;
    yearlist: AcademicYear[];
    studentdivlist: StudentComplaint[] | null;
    section_s_list: any[] | null;
    class_s_list: any[] | null;
    student_leave_list: any[] | null;
    student_id_list: any[] | null;
    aslaP_Id: number;
    aslaP_AppRejDate: string | null;
    aslaP_AppFromDate: string | null;
    aslaP_AppToDate: string | null;
    aslaP_LeaveStatus: string | null;
    asalP_RejectReason: string | null;
    ivrmalU_Id: number | null;
    asaP_Id: number;
    asaP_ApprovalBy: string | null;
    asaP_ActiveFlg: boolean;
    asaP_ApprovalDate: string | null;
    asapcS_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    asapcS_ActiveFlg: boolean;
    amsT_FirstName: string | null;
    asmcL_ClassName: string | null;
    asmC_SectionName: string | null;
    amsT_RegistrationNo: string | null;
    amsT_emailId: string | null;
    amsT_MobileNo: number;
    studentdetails: any | null;
    roletype: string | null;
    flag: string | null;
    userId: number;
    ivrmrT_Id: number;
    flag_Type: string | null;
    returnval: boolean;
    allstuddata: any | null;
    editlist: any | null;
    pendingleave: any | null;
    hrmE_Id: number;
    duplicate: boolean;
    createdDate: string | null;
    updatedDate: string | null;
}

export interface ComplaintLoadDataResponse {
    success: boolean;
    message: string;
    data: {
        stuyearlist: AcademicYear[] | null;
        studetiallist: StudentComplaint[] | [];
        academicYears?: string[]; // Keeping for backward compat if needed, though new JSON doesn't have it
        complaintsData?: StudentComplaint[];
        // Add other fields if necessary, but using 'any' for the rest of the huge DTO to avoid clutter unless specific fields are needed.
        [key: string]: any;
    };
    total: number | null;
    page: number | null;
    page_size: number | null;
}

export interface ComplaintReportPayload {
    ASMAY_Id: number;
    MI_Id: number;
    AMST_Id: number;
}

export interface ComplaintReportData {
    mI_Id: number;
    amsT_Id: number;
    asmaY_Id: number;
    yearlist: AcademicYear[] | null;
    studentdivlist: StudentComplaint[] | null;
    amsT_FirstName: string | null;
    amsT_AdmNo: string | null;
    amaY_RollNo: number;
    asmcL_Id: number;
    asmS_Id: number;
    asmaY_Year: string | null;
    asmcL_ClassName: string | null;
    asmC_SectionName: string | null;
    ascomP_Complaints: string | null;
    studentdivlist1: StudentComplaint[] | null;
    complaintsData?: StudentComplaint[];
    studetiallist?: StudentComplaint[];
}

export interface ComplaintReportResponse {
    success: boolean;
    message: string;
    data: any | ComplaintReportData; // Can be a direct list or wrapped
    complaintsData?: StudentComplaint[];
    studetiallist?: StudentComplaint[];
    studentdivlist?: StudentComplaint[];
    studentdivlist1?: StudentComplaint[];
    [key: string]: any;
}
