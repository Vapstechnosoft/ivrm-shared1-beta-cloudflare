export interface AcademicYear {
    ttfG_Id: number;
    asmaY_Year: string;
}

export interface Category {
    ttmC_Id: number;
    categoryname: string;
}

export interface TotalNoOfPeriods {
    asmcL_Id: number;
    asmcL_TotalNoOfPeriods: string;
}

export interface TotalNoOfPeriodsAllotted {
    asms_Id: number;
    asms_TotalNoOfPeriodsAllotted: string;
}

export interface TotalNoOfperiodNotallotted {
    hrmE_Id: number;
    TotalNoofperiodallotted: string;
}

export interface InstutionName {
    insname: number;
    inst_name: string;
}

export interface TTGenerationGridData {
    ttfG_Id: number;
    insname: string;
    asmayname: string;
    categoryname: string;
    ttfG_ActiveFlag: boolean;
}

export interface GenerationDetails {
    totalPeriods: number;
    allottedPeriods: number;
    notAllottedPeriods: number;
    notConfirmedPeriods: number;
}
