export interface IPDAReportItem {
    PAYMENT_DATE: string;
    CODE: string;
    PARTICULARS: string;
    PDAE_VoucherNo: string;
    DEBIT: number;
    CREDIT: number;
    TYPEORG: string;
    TYPEORG1: string;
    BALANCE: number;
}

export interface IPDAStudent {
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_AdmNo: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
}

export type LegacyArray<T> = T[] | { $values: T[] };

export interface IPDAReportResponse {
    type: 'All' | 'CR' | 'DR';
    get_allreport?: LegacyArray<IPDAReportItem>;
    get_creditreport?: LegacyArray<IPDAReportItem>;
    get_debitreport?: LegacyArray<IPDAReportItem>;
    fillstudent: LegacyArray<IPDAStudent>;
}

export interface IPDALoadDataResponse {
    fillyear: LegacyArray<{ asmaY_Id: number; asmaY_Year: string; Selected?: boolean }>;
    classlist: LegacyArray<{ asmcL_Id: number; asmcL_ClassName: string; selected?: boolean }>;
    searcharray: LegacyArray<{ AMSC_Id: number; asmc_sectionname: string; selected?: boolean }>;
}

export interface IPDASectionResponse {
    fillsection: LegacyArray<{ AMSC_Id: number; asmc_sectionname: string; selected?: boolean }>;
}

export interface IPDAStudentResponse {
    fillstudent: LegacyArray<{ Amst_Id: number; amsT_FirstName: string; amsT_AdmNo: string; Selected?: boolean }>;
}
