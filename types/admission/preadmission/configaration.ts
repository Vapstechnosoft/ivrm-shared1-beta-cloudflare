export interface IInstitutionItem {
    mI_Id: number;
    mI_Name: string;
    mI_Logo?: string;
    [key: string]: any;
}

export interface IMasterAcademicYearMasterList {
    asmaY_Id: number;
    mI_Id: number;
    asmaY_Year: string;
    asmaY_From_Date: string;
    asmaY_To_Date: string;
    asmaY_PreAdm_F_Date: string;
    asmaY_PreAdm_T_Date: string;
    asmaY_Order: number;
    asmaY_ActiveFlag: number;
    mI_Name?: string;
    asmaY_PreAdm_F_Time?: string | null;
    asmaY_PreAdm_T_Time?: string | null;
    asmaY_Cut_Of_Date: string;
    asmaY_Pre_ActiveFlag: number;
    is_Active: boolean;
    asmaY_ReggularFlg: boolean;
    asmaY_NewFlg: boolean;
    asmaY_NewAdmissionFlg: boolean;
    asmaY_CreatedBy: number;
    asmaY_UpdatedBy: number;
    asmaY_ReferenceDate: string;
    asmaY_ArrearFeeDate: string;
    asmaY_AdvanceFeeDate: string;
    asmaY_TransportEDate: string;
    asmaY_TransportSDate: string;
    asmaY_AcademicYearCode: string;
    asmaY_RegularFeeFDate: string;
    asmaY_RegularFeeTDate: string;
    createdDate: string;
    updatedDate: string;
}

export interface IAcademicYearDetailsResponse {
    academicList?: IMasterAcademicYearMasterList[];
    institutionList?: IInstitutionItem[];
    getYear?: IMasterAcademicYearMasterList[];
    getAllYear?: IMasterAcademicYearMasterList[];
    getAllYearNew?: IMasterAcademicYearMasterList[];
    paginatedList?: IMasterAcademicYearMasterList[];
    totalRecords?: number;
    [key: string]: any;
}

export interface IMasterSetOrderList {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order: number;
}

export interface IMasterTransactionNumberingList {
    imN_Id?: number;
    mI_Id?: number;
    imN_AutoManualFlag?: string;
    imN_DuplicatesFlag?: any;
    imN_StartingNo?: string;
    imN_WidthNumeric?: string;
    imN_ZeroPrefixFlag?: string;
    imN_PrefixAcadYearCode?: boolean;
    imN_PrefixParticular?: any;
    imN_SuffixAcadYearCode?: boolean;
    imN_SuffixParticular?: string;
    imN_RestartNumFlag?: string;
    imN_Flag?: string;
    imN_PrefixFinYearCode?: any;
    imN_PrefixCalYearCode?: any;
    imN_SuffixFinYearCode?: any;
    imN_SuffixCalYearCode?: any;
    createdDate?: string;
    updatedDate?: string;

    // Receipt-specific fields (IRN_*)
    irN_Id?: number;
    IRN_Id?: number;
    irN_TransactionName?: string;
    IRN_TransactionName?: string;
    irN_AutoManualFlag?: string;
    IRN_AutoManualFlag?: string;
    irN_DuplicatesFlag?: string;
    IRN_DuplicatesFlag?: string;
    irN_StartingNo?: string;
    IRN_StartingNo?: string;
    irN_WidthNumeric?: string;
    IRN_WidthNumeric?: string;
    irN_ZeroPrefixFlag?: string;
    IRN_ZeroPrefixFlag?: string;
    irN_PrefixAcadYearCode?: boolean;
    IRN_PrefixAcadYearCode?: boolean;
    irN_PrefixFinYearCode?: boolean;
    IRN_PrefixFinYearCode?: boolean;
    irN_PrefixCalYearCode?: boolean;
    IRN_PrefixCalYearCode?: boolean;
    irN_PrefixParticular?: string;
    IRN_PrefixParticular?: string;
    irN_SuffixAcadYearCode?: boolean;
    IRN_SuffixAcadYearCode?: boolean;
    irN_SuffixFinYearCode?: boolean;
    IRN_SuffixFinYearCode?: boolean;
    irN_SuffixCalYearCode?: boolean;
    IRN_SuffixCalYearCode?: boolean;
    irN_SuffixParticular?: string;
    IRN_SuffixParticular?: string;
    irN_RestartNumFlag?: string;
    IRN_RestartNumFlag?: string;
    irN_RestartAcadYear?: boolean;
    IRN_RestartAcadYear?: boolean;
    irN_RestartFinYear?: boolean;
    IRN_RestartFinYear?: boolean;
    irN_RestartcalendYear?: boolean;
    IRN_RestartcalendYear?: boolean;

    // Voucher-specific fields (IVN_*)
    ivN_Id?: number;
    IVN_Id?: number;
    ivN_VoucherName?: string;
    IVN_VoucherName?: string;
    ivN_VoucherID?: string;
    IVN_VoucherID?: string;
    ivN_AutoManualFlag?: string;
    IVN_AutoManualFlag?: string;
    ivN_DuplicatesFlag?: string;
    IVN_DuplicatesFlag?: string;
    ivN_StartingNo?: string;
    IVN_StartingNo?: string;
    ivN_WidthNumeric?: string;
    IVN_WidthNumeric?: string;
    ivN_ZeroPrefixFlag?: string;
    IVN_ZeroPrefixFlag?: string;
    ivN_PrefixFinYearCode?: boolean;
    IVN_PrefixFinYearCode?: boolean;
    ivN_PrefixParticular?: string;
    IVN_PrefixParticular?: string;
    ivN_SuffixFinYearCode?: boolean;
    IVN_SuffixFinYearCode?: boolean;
    ivN_SuffixParticular?: string;
    IVN_SuffixParticular?: string;
    ivN_RestartNumFlag?: string;
    IVN_RestartNumFlag?: string;

    [key: string]: any;
}
