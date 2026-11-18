export interface IPDAOverAllLoadData {
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
}

export interface IPDAOverAllSection {
    fillsection: {
        $values: {
            amsC_Id: number;
            asmc_sectionname: string;
        }[];
    };
}

export interface IPDAOverAllReportRow {
    StudentName: string;
    AMST_AdmNo: string;
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    Opening_Balance: number;
    Wallet_Amount: number;
    Spent_Amount: number;
    Balance_Amount: number;
    selected?: boolean;
}

export interface IPDAOverAllReportResponse {
    headwise: {
        $values: IPDAOverAllReportRow[];
    };
}

export interface IPDAOverAllReportRequest {
    ASMAY_Id: number;
    ASMCL_Id: number;
    AMSC_Id: number;
    active: number;
    deactive: number;
    left: number;
}
