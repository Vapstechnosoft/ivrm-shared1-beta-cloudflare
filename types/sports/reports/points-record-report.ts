export interface IYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IClass {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface ISection {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface IHouse {
    spccmH_Id: number;
    spccmH_HouseName: string;
}

export interface IEvent {
    spccmE_Id: number;
    spccmE_EventName: string;
}

export interface ISports {
    spccmscC_Id: number;
    spccmscC_SportsCCName: string;
}

export interface ICategory {
    spccmcC_Id: number;
    spccmcC_CompitionCategory: string;
}

export interface IPlace {
    spccestR_Rank: string;
}

export interface IPointsRecordReportData {
    amsT_AdmNo: string;
    amsT_Name: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    spccestR_Points: number;
    spccestR_Rank: string;
    spccE_StartDate: string;
    spccmeV_EventVenue: string;
    spccmE_EventName: string;
    spccmH_HouseName: string;
    asmcL_Id: number;
    asmS_Id: number;
    spccmE_Id: number;
    amsT_Id: number;
    spccmscC_SportsCCName: string;
    spccmscC_Id: number;
    asmaY_Year: string;
    spccestR_Remarks: string;
    // Fields used in SportPointsAndRecordReport grid
    amst_Id?: number;
    adm_no?: string;
    studentname?: string;
    spccestR_Place?: string;
    spccestR_Points?: number;
    spccmD_DivisionName?: string;
    spccmH_HouseName?: string;
}

export interface IPointsRecordReportLoadData {
    academicYear: IYear[];
    yearlist: IYear[];
    venueList: any[];
    eventList: IEvent[];
    sportslist: ISports[];
    categoryList: ICategory[];
    houseList: IHouse[];
    events: any[];
    divisionList: any[];
    classList?: IClass[]; // Added
    sectionList?: ISection[]; // Added
}

export interface IPointsRecordReportRequest {
    type: string;
    asmaY_Id: number;
    asmcL_Id?: number;
    asmS_Id?: number;
    spccmH_Id?: number;
    spccmD_Id?: number;
    spccmE_Id?: number;
    spccE_Id?: number;
    // Multi-select lists for PointsRecordReport
    selectedhouselist?: { spccmH_Id: number }[];
    selectedeventlist?: { spccmE_Id: number }[];
    selectedsportslist?: { spccmscC_Id: number }[];
    selectedSectionlist?: { asmS_Id: number }[];
    placListData?: { spccestR_Rank: string }[];
    spccmcC_Id?: number;
}

import { z } from 'zod';

export const SportPointsAndRecordReportSchema = z.object({
    qualification_type: z.enum(['eca', 'cca', 'ih', 'others']),
    asmaY_Id: z
        .number({ required_error: 'Select Academic Year', invalid_type_error: 'Select Academic Year' })
        .min(1, 'Select Academic Year'),
    asmcL_Id: z.number().optional(),
    asmS_Id: z.number().optional(),
    spccmH_Id: z.number({ required_error: 'Select House Name', invalid_type_error: 'Select House Name' }).min(1, 'Select House Name'),
    spccE_Id: z.number({ required_error: 'Select Program Name', invalid_type_error: 'Select Program Name' }).min(1, 'Select Program Name'),
    spccmE_Id: z.number({ required_error: 'Select Event Name', invalid_type_error: 'Select Event Name' }).min(1, 'Select Event Name'),
    spccmD_Id: z
        .number({ required_error: 'Select Division Name', invalid_type_error: 'Select Division Name' })
        .min(1, 'Select Division Name')
});

export type SportPointsAndRecordReportFormSchema = z.infer<typeof SportPointsAndRecordReportSchema>;
