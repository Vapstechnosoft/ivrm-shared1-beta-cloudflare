export interface IYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IHouse {
    spccmH_Id: number;
    spccmH_HouseName: string;
}

export interface IClass {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface ISection {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface ISportsYearEndReportLoadData {
    yearlist: IYear[];
    houseList: IHouse[];
}

export interface ISportsYearEndReportClassData {
    classList: IClass[];
}

export interface ISportsYearEndReportSectionData {
    sectionList: ISection[];
}

export interface ISportsYearEndReportData {
    asmcL_ClassName: string;
    asmC_SectionName: string;
    amsT_Name: string;
    amsT_AdmNo: string;
    amsT_DOB: string;
    spccmE_EventName: string;
    spccmeV_EventVenue: string;
    spccmscC_SportsCCName: string;
    spccE_StartDate: string;
    spccestR_Points: number;
    spccestR_Rank: string;
    // Add other fields as necessary from typical report data
}

export interface ISportsYearEndReportRequest {
    ASMAY_Id: number;
    Type: string;
    selectedClasslist?: { ASMCL_Id: number }[];
    selectedSectionlist?: { ASMS_Id: number }[];
}
