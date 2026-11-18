export interface IFeeChequeBounceGrid {
    fcB_Id: number;
    asmaY_Year: string;
    fcB_DATE: string;
    amsT_FirstName: string;
    amsT_MiddleName: string | null;
    amsT_LastName: string | null;
    fyP_Receipt_No: string;
}

export interface IFeeChequeBounceDropdowns {
    fillyear: { asmaY_Id: number; asmaY_Year: string }[];
    classlist: { asmcL_Id: number; asmcL_ClassName: string; Selected?: boolean }[];
    alldata: IFeeChequeBounceGrid[];
    fillreceipt: { fyP_ID: number; fyP_Receipt_No: string; Selected?: boolean }[];
}

export interface IFeeChequeBounceSection {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface IFeeChequeBounceStudent {
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_MiddleName: string | null;
    amsT_LastName: string | null;
    Selected?: boolean;
}

export interface IFeeChequeBounceReceipt {
    fyP_ID: number;
    fyP_Receipt_No: string;
    Selected?: boolean;
}

export interface IFeeChequeBounceSavePayload {
    ASMAY_ID: number;
    AMST_Id: number;
    FYP_ID: number;
    FCB_DATE: string;
    FCB_Remarks: string;
}

export interface IFeeChequeBounceSearchPayload {
    searchType: string;
    searchtext?: string;
    searchdate?: string;
    ASMAY_ID: number;
}
