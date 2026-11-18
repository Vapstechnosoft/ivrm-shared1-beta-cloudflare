export interface IPcIndent {
    slno: number;
    pcindT_Id: number;
    pcindT_IndentNo: string;
    mdept_Id: number;
    departmentname: string;
    approvedBy: string;
    pcindT_Date: string | Date;
    pcindT_ActiveFlg: boolean;
}

export interface IIndentFilters {
    mI_Id: number;
    from_Date: Date | string;
    to_Date: Date | string;
}
