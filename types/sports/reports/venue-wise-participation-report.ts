export interface ISportVenueWiseParticipationReportYear {
    asmaY_Id: number;
    mI_Id: number;
    asmaY_Year: string;
    asmaY_From_Date: string;
    asmaY_To_Date: string;
    asmaY_PreAdm_F_Date: string;
    asmaY_PreAdm_T_Date: string;
    asmaY_Order: number;
    asmaY_ActiveFlag: number;
    asmaY_Cut_Of_Date: string;
    asmaY_Pre_ActiveFlag: number;
    is_Active: boolean;
    asmaY_ReggularFlg: boolean;
    asmaY_NewFlg: boolean;
    asmaY_NewAdmissionFlg: boolean;
    asmaY_CreatedBy: number;
    asmaY_UpdatedBy: number;
    asmaY_AcademicYearCode: string;
    asmaY_RegularFeeFDate: string;
    asmaY_RegularFeeTDate: string;
    createdDate: string;
    updatedDate: string;
}

export interface ISportVenueWiseParticipationReportClass {
    asmcL_Id: number;
    mI_Id: number;
    asmcL_ClassName: string;
    asmcL_MinAgeYear: number;
    asmcL_MinAgeMonth: number;
    asmcL_MinAgeDays: number;
    asmcL_MaxAgeYear: number;
    asmcL_MaxAgeMonth: number;
    asmcL_MaxAgeDays: number;
    asmcL_Order: number;
    asmcL_ClassCode: string;
    asmcL_ActiveFlag: boolean;
    asmcL_MaxCapacity: number;
    asmcL_PreadmFlag: number;
    createdDate: string;
    updatedDate: string;
}

export interface ISportVenueWiseParticipationReportSection {
    asmS_Id: number;
    mI_Id: number;
    asmC_SectionName: string;
    asmC_SectionCode: string;
    asmC_Order: number;
    asmC_ActiveFlag: number;
    asmC_MaxCapacity: number;
    createdDate: string;
    updatedDate: string;
}

export interface ISportVenueWiseParticipationReportStudent {
    amsT_Id: number;
    studentname: string;
}

export interface ISportVenueWiseParticipationReportVenue {
    spccmeV_Id: number;
    spccmeV_EventVenue: string;
}

export interface ISportVenueWiseParticipationReportHouse {
    spccmH_Id: number;
    spccmH_HouseName: string;
}

export interface ISportVenueWiseParticipationReportData {
    yearlist: ISportVenueWiseParticipationReportYear[];
    classList: ISportVenueWiseParticipationReportClass[];
    sectionList: ISportVenueWiseParticipationReportSection[];
    studentList1: ISportVenueWiseParticipationReportStudent[];
    venueList: ISportVenueWiseParticipationReportVenue[];
    houseList: ISportVenueWiseParticipationReportHouse[];
}

export interface ISportVenueWiseParticipationReportPayload {
    asmaY_Id: number;
    asmcL_Id?: number;
    asmS_Id?: number[];
    type?: string;
    selectedVenuelist?: { spccmeV_Id: number }[];
    selectedhouselist?: { spccmH_Id: number }[];
    selectedSectionlist?: { asmS_Id: number }[];
    page?: number;
    page_size?: number;
    search_column?: string;
    search_query?: string;
    sort_column?: string;
    sort_direction?: string;
}

export interface SportVenuewiseReportData {
    id: number;
    spccmH_HouseName: string;
    spccmeV_EventVenue: string;
    amsT_Name: string;
    amsT_AdmNo: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    spccmE_EventName: string;
    spccmscc_SportsCCName: string;
    spccE_StartDate: string; // ISO date string
}

// Aliases for compatibility
export type IVenueWiseReportData = SportVenuewiseReportData;
export type IVenueWiseReportDropdowns = ISportVenueWiseParticipationReportData;
export type VenueWiseParticipationReportFormSchema = ISportVenueWiseParticipationReportPayload;
