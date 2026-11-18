export interface IPDASummaryLoadData {
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
    pdaheadlist: {
        $values: {
            pdaR_RefundRemarks: string;
        }[];
    };
    invheadlist: {
        $values: {
            invmG_GroupName: string;
        }[];
    };
}

export interface IPDASummarySection {
    fillsection: {
        $values: {
            amsC_Id: number;
            asmc_sectionname: string;
        }[];
    };
}

export interface IPDASummaryStudent {
    fillstudent: {
        $values: {
            amsT_Id: number;
            amsT_FirstName: string;
            amsT_AdmNo: string;
        }[];
    };
}

export interface IPDAInvDetail {
    AMST_Id: number;
    AMST_AdmNo: string;
    AMST_FirstName: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    [key: string]: any; // Dynamic store columns
}

export interface IPDAPdaDetail {
    AMST_Id: number;
    [key: string]: any; // Dynamic PDA head columns
}

export interface IPDAObDetail {
    AMST_Id: number;
    PDAS_OBStudentDue: number;
    PDAS_OBExcessPaid: number;
    PDAS_CYDeposit: number;
    PDAS_CYRefundAmt: number;
}

export interface IPDAConcession {
    AMST_Id: number;
    FSS_ConcessionAmount: number;
}

export interface IPDASummaryReportResponse {
    invdetails: {
        $values: IPDAInvDetail[];
    };
    pdadetails: {
        $values: IPDAPdaDetail[];
    };
    obdetails: {
        $values: IPDAObDetail[];
    };
    transnumconfig: {
        $values: IPDAConcession[];
    };
}

export interface IProcessedSummaryRow extends IPDAInvDetail {
    pdaInfo: IPDAPdaDetail;
    obInfo: IPDAObDetail;
    conInfo: IPDAConcession;
    studentTotExp: number;
    balance: number;
}

export interface IPDASummaryReportRequest {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number; // Corrected from AMSC_Id to match the AngularJS payload
    AMST_Id: number;
    type: string;
    studentdata: number;
    refundamt: number;
}
