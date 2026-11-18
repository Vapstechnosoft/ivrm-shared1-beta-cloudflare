export interface IPDADebitCreditReportParams {
    ASMAY_Id: number;
    ASMCL_Id: number;
    AMSC_Id: number;
    Amst_Id: number;
    From_Date: string;
    To_Date: string;
    type: string;
}

export interface IPDADebitCreditReportRow {
    PAYMENT_DATE: string;
    CODE: string;
    PARTICULARS: string;
    DEBIT: number;
    CREDIT: number;
    TYPEORG: string;
    TYPEORG1: string;
    BALANCE: number;
}

export interface IPDADebitCreditStudentDetail {
    amsT_FirstName: string;
    amsT_AdmNo: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
}

export interface IPDADebitCreditReportResponse {
    transnumconfig?: IPDADebitCreditReportRow[] | null;
    fillstudent?: IPDADebitCreditStudentDetail[] | null;
    fillyear?: any[];
    classlist?: any[];
    searcharray?: any[];
    fillsection?: any[];
    fillstudentlist?: any[];
}
