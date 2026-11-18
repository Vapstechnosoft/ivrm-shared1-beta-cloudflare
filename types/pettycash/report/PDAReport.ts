//income- report

export interface IPDAReportIncome {
    payment_Mode: string;
    fyP_Tot_Amount: number;
    cashAmount?: number;
    bankAmount?: number;
}

export interface IPDAReportExpense {
    particular: string;
    pcreqtndeT_Amount: number;
}

export interface IPDAReportSummary {
    pcreqtndeT_Amount: number;
}

export interface IPDAReportResponse {
    incomereport?: IPDAReportIncome[];
    expensereport?: IPDAReportExpense[];
    fhwR_searchdatalist?: IPDAReportSummary[];
    income?: IPDAReportIncome[];
    expense?: IPDAReportExpense[];
}

export interface IPDAReportParams {
    ASMAY_Id: number;
    From_Date: string;
    To_Date?: string;
}
