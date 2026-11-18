export interface IPurchaseDonateReportInitialData {
    LBCPA_Flg: string;
}

export interface IPurchaseDonateReportRequest {
    mI_Id?: number;
    MI_Id?: number;
    circ_Flag?: string; // Book Category: "Book", "Non-Book"
    lbcpA_Flg?: string; // Type: "Purchased", "Donated"
    LMB_BookType?: string;
    book_Flag?: string;
}

export interface IPurchaseDonateReportGridData {
    lmB_BookType: string;
    lmbanO_AccessionNo: string;
    lmB_BookTitle: string;
    name: string; // Author Name
    lmV_VendorName: string;
    lmB_PurchaseDate: string;
    lmB_NoOfCopies: number;
    lmB_Price: number;
    lmB_Discount: number;
    lmB_NetPrice: number;
    [key: string]: any;
}

export type IPurchaseDonateReportResponse = {
    success: boolean;
    data: IPurchaseDonateReportGridData[];
    message?: string;
};
