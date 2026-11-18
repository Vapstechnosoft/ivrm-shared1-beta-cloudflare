export interface IAvailableBooksReportInitialData {
    libraryList?: Array<{
        lmaL_Id: number;
        lmaL_LibraryName: string;
        [key: string]: any;
    }>;

    departmentList?: Array<{
        lmD_Id: number;
        lmD_DepartmentName: string;
        [key: string]: any;
    }>;
    [key: string]: any;
}

export interface IAvailableBooksReportRequest {
    type?: string;
    Type?: string;
    type2?: string;
    Type2?: string;
    lmD_Id?: number;
    LMD_Id?: number;
    lmaL_Id?: number;
    LMAL_Id?: number;
    statuscount?: boolean;
    Fromdate?: string;
    fromdate?: string;
    ToDate?: string;
    todate?: string;
    subjectsthomos?: boolean;
    stthomosSubject?: any[];
    [key: string]: any;
}

export interface IAvailableBooksReportGridData {
    lmB_EntryDate?: string;
    lmbanO_AccessionNo?: string;
    lmB_BookTitle?: string;
    lmB_ISBNNo?: string;
    lmB_CallNo?: string;
    lmB_ClassNo?: string;
    lmB_NetPrice?: number;
    lmB_BookType?: string;
    lmD_DepartmentName?: string;
    authorName?: string;
    lmP_PublisherName?: string;
    lmL_LanguageName?: string;
    lmS_SubjectName?: string;
    lmB_PurOrDonated?: string;
    lmB_Price?: number;
    lmB_BillNo?: string;
    lmB_PurchaseDate?: string;
    [key: string]: any;
}

export type IAvailableBooksReportResponse = IAvailableBooksReportGridData[];
