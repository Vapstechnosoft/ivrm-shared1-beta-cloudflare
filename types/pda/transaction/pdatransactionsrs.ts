export interface IPDATransactionLoadData {
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
    pdadata: {
        $values: IPDATransactionHead[];
    };
    fillstudent: {
        $values: IPDATransactionStudent[];
    };
    receiparraydelete: {
        $values: IPDATransactionListItem[];
    };
    rolename: string;
    transnumconfig: {
        $values: {
            imN_AutoManualFlag: string;
        }[];
    };
}

export interface IPDATransactionHead {
    pdamH_Id: number;
    pdamH_HeadName: string;
    Selected?: boolean;
}

export interface IPDATransactionStudent {
    amst_Id: number;
    amsT_FirstName: string;
    amsT_MiddleName?: string;
    amsT_LastName?: string;
    amsT_AdmNo: string;
    amsT_RegistrationNo?: string;
    amaY_RollNo?: number;
    classname?: string;
    sectionname?: string;
    amst_mobile?: string;
    fathername?: string;
    studentdob?: string;
    amsT_Photoname?: string;
    selected?: boolean;
}

export interface IPDATransactionListItem {
    pdaE_ID: number;
    amst_Id: number;
    amsT_FirstName: string;
    amsT_MiddleName?: string;
    amsT_LastName?: string;
    classname: string;
    sectionname: string;
    amsT_AdmNo: string;
    transactionno: string;
    voucherno: string;
    pdaE_TotAmount: number;
    pdaE_Date: string;
    pdaR_ModeOfPayment: string;
    selected?: boolean;
}

export interface IPDATransactionSaveRequest {
    ASMAY_Id: number;
    PDAE_ID?: number;
    savetmpdata: any[];
    Amst_Id?: number;
    amount: number;
    PDAE_Date: string;
    AMST_Ids?: number[];
    type: string;
    PDAR_ModeOfPayment: string;
    transnumconfigsettings?: any;
    voucherno?: string;
    studentlistarray?: { Amst_Id: number }[];
}

export interface IPDATransactionSearchRequest {
    searchType: string;
    searchtext?: string;
    searchnumber?: number;
    searchdate?: string;
    ASMAY_Id: number;
}
