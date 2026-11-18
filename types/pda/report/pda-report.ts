export interface IPDAReportLoadData {
    fillyear: {
        $values: {
            asmaY_Id: number;
            asmaY_Year: string;
            Selected?: boolean;
        }[];
    };
    classlist: {
        $values: {
            asmcL_Id: number;
            asmcL_ClassName: string;
        }[];
    };
    searcharray: {
        $values: {
            amsC_Id: number;
            asmc_sectionname: string;
        }[];
    };
}

export interface IPDAReportSection {
    fillsection: {
        $values: {
            amsC_Id: number;
            asmc_sectionname: string;
        }[];
    };
}

export interface IPDAReportStudent {
    fillstudent: {
        $values: {
            amsT_Id: number;
            amsT_FirstName: string;
            amsT_AdmNo: string;
        }[];
    };
}

export interface IPDAReportRow {
    AMST_Id: number;
    AMST_FirstName: string;
    AMST_AdmNo: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    PDAE_TransactionNo: string;
    PDAE_Date: string;
    PDAMH_HeadName: string;
    PDAEH_Amount: number;
    PDAE_Remarks: string;
}

export interface IPDAPaidRecord {
    amst_Id: number;
    fsS_PaidAmount: number;
    fsS_CurrentYrCharges: number;
}

export interface IPDAAdmStudent {
    amst_Id: number;
    pdaS_OBExcessPaid: number;
    pdaS_OBStudentDue: number;
    pdaS_CYRefundAmt: number;
    pdaS_CBStudentDue: number;
}

export interface IPDAReportResponse {
    headwise: {
        $values: IPDAReportRow[];
    };
    searcharray: {
        $values: IPDAPaidRecord[];
    };
    admsudentslist: {
        $values: IPDAAdmStudent[];
    };
}

export interface IPDAReportRequest {
    ASMAY_Id: number;
    ASMCL_Id: number;
    AMSC_Id: number;
    AMST_Id: number;
    From_Date: string;
    To_Date: string;
    type: string;
    studentdata: number; // detailed
    refundamt: number; // stored
}
