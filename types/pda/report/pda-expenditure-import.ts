export interface IPDAExpenditureImportLoadData {
    feeGroup: { fmG_Id: number; fmG_GroupName: string; Selected?: boolean }[];
    feeHead: { fmH_Id: number; fmH_FeeName: string; Selected?: boolean }[];
    academicyearlist: { asmaY_Id: number; asmaY_Year: string; Selected?: boolean }[];
}

export interface IPDAExpenditureImportRow {
    RollNumber: string;
    Date: string;
    Amount: string | number;
    StudentName: string;
    Particulars: string;
    VoucherNo: string;
    [key: string]: any;
}

export interface IPDAExpenditureSaveData {
    FeeReceiptimport: {
        AMST_AdmNo: string;
        PDAE_Date: string;
        PDAE_TotAmount: number;
        AMST_FirstName: string;
        Particular: string;
        VoucherNo: string;
        remarks: string;
    }[];
    ASMAY_Id: number;
    PDAR_ModeOfPayment: 'Debit' | 'Credit';
}

export interface IPDAExpenditureSaveResponse {
    returnval: boolean;
    studentdata: string;
    stuStatus?: string;
}
