export interface IPDAExpenditureImportItem {
    RollNumber: string;
    Date: string;
    Amount: number;
    StudentName: string;
    Particulars: string;
    VoucherNo: string;
}

export interface IPDAExpenditureImportPayload {
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
    PDAR_ModeOfPayment: string;
}

export interface IPDAExpenditureImportDetailsResponse {
    academicyearlist: { asmaY_Id: number; asmaY_Year: string; Selected?: boolean }[];
    feeGroup: any[];
    feeHead: any[];
}

export interface IPDAExpenditureImportSaveResponse {
    returnval: boolean;
    studentdata: string;
}
